import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";
import {
  normalizeOrder,
  verifySignature,
  PAYMENT_LINK,
  STRIPE_ACCOUNT,
} from "./normalize.mjs";
import { dispatchOrderAlerts } from "./alerts.mjs";
declare const EdgeRuntime: { waitUntil(task: Promise<unknown>): void };

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(url, serviceKey, { auth: { persistSession: false } });
const origins = new Set([
  "https://admin.befitliner.com",
  "https://www.befitliner.com",
  "https://befitliner.com",
  "http://localhost:3000",
  "http://localhost:3001",
]);
function reply(req: Request, body: unknown, status = 200) {
  const origin = req.headers.get("origin") || "";
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Vary: "Origin",
      ...(origins.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
async function state() {
  const { data, error } = await db
    .from("gym_admin_sync_state")
    .select("*")
    .eq("id", true)
    .single();
  if (error) throw new Error("Synchronizačná konfigurácia nie je dostupná.");
  return data;
}
async function saveState(values: Record<string, unknown>) {
  const { error } = await db
    .from("gym_admin_sync_state")
    .update(values)
    .eq("id", true);
  if (error) throw new Error("Synchronizačný stav sa nepodarilo uložiť.");
}
async function notifyPaidOrders() {
  // SMS availability must never prevent recording a payment or acknowledging Stripe.
  let lastError: string | null = null;
  try {
    await dispatchOrderAlerts(db, (name: string) => Deno.env.get(name));
  } catch (error) {
    lastError = error instanceof Error ? error.message : "Odosielanie SMS zlyhalo.";
  }
  try {
    await db.from("gym_admin_alert_settings").update({
      last_error: lastError,
      checked_at: new Date().toISOString(),
    }).eq("id", true);
  } catch {
    // Queue state survives; Stripe acknowledgment does not depend on SMS diagnostics.
  }
}
let verifiedKey: string | null = null;
async function stripeKey() {
  if (verifiedKey) return verifiedKey;
  const keys = [
    ...new Set(
      [
        "GYM_ADMIN_STRIPE_SECRET_KEY",
        "STRIPE_SECRET_KEY",
        "HEALTH_STRIPE_LIVE_SECRET_KEY",
      ]
        .map((k) => Deno.env.get(k))
        .filter((k) => k && /^(sk|rk)_live_/.test(k)),
    ),
  ];
  for (const key of keys) {
    const r = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (r.ok && (await r.json()).id === STRIPE_ACCOUNT) {
      verifiedKey = key!;
      return key!;
    }
  }
  throw new Error(
    "Chýba platný live Stripe kľúč pre účet Fitliner Platform – Globalio LLC.",
  );
}
async function stripe(
  path: string,
  params?: URLSearchParams,
  idempotency?: string,
) {
  const r = await fetch(`https://api.stripe.com/v1${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${await stripeKey()}`,
      "Stripe-Version": "2025-02-24.acacia",
      ...(params
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
      ...(idempotency ? { "Idempotency-Key": idempotency } : {}),
    },
    body: params,
  });
  if (!r.ok) {
    await r.text();
    throw new Error(`Stripe požiadavka zlyhala (${r.status}).`);
  }
  return r.json();
}
async function importSession(id: string) {
  // Re-fetch canonical state for both webhook and sync; delayed/retried events cannot assert payment.
  const observedAt = new Date().toISOString();
  const session = await stripe(
    `/checkout/sessions/${encodeURIComponent(id)}?expand[]=payment_intent.latest_charge`,
  );
  if (session.payment_link !== PAYMENT_LINK || !session.livemode) return false;
  const items = await stripe(
    `/checkout/sessions/${encodeURIComponent(id)}/line_items?limit=100`,
  );
  const charge = session.payment_intent?.latest_charge;
  const record = normalizeOrder(
    session,
    items,
    typeof charge === "object" ? charge : null,
    observedAt,
  );
  const { error } = await db.rpc("gym_admin_import_order", { p_order: record });
  if (error) throw new Error("Objednávku sa nepodarilo uložiť do databázy.");
  return true;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return reply(req, { ok: true });
  if (req.method !== "POST")
    return reply(req, { error: "Method not allowed" }, 405);
  let authorized = false;
  try {
    const sig = req.headers.get("stripe-signature");
    if (sig) {
      const body = await req.text();
      const config = await state();
      if (
        !config.webhook_secret ||
        !(await verifySignature(body, sig, config.webhook_secret))
      )
        return reply(req, { error: "Invalid signature" }, 400);
      const event = JSON.parse(body);
      if (!event.livemode || event.account)
        return reply(req, { received: true, ignored: true });
      const object = event.data?.object;
      if (
        event.type.startsWith("checkout.session.") &&
        object?.payment_link === PAYMENT_LINK
      )
        await importSession(object.id);
      else if (event.type.startsWith("charge.") && object?.payment_intent) {
        const { data, error } = await db
          .from("gym_module_orders")
          .select("stripe_session_id")
          .eq("stripe_payment_intent_id", object.payment_intent);
        if (error) throw new Error("Objednávku sa nepodarilo vyhľadať.");
        for (const order of data || [])
          await importSession(order.stripe_session_id);
      }
      EdgeRuntime.waitUntil(notifyPaidOrders());
      return reply(req, { received: true });
    }
    const token =
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    if (!token) return reply(req, { error: "Unauthorized" }, 401);
    const config = await state();
    const isService = token === serviceKey;
    const isCron = !!config.cron_secret && token === config.cron_secret;
    if (!isService && !isCron) {
      const client = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      });
      const { data: auth, error } = await client.auth.getUser();
      if (error || !auth.user)
        return reply(req, { error: "Unauthorized" }, 401);
      const { data: allowed, error: denied } = await client.rpc(
        "is_gym_console_admin",
      );
      if (denied || !allowed) return reply(req, { error: "Forbidden" }, 403);
    }
    authorized = true;
    const input = await req.json();
    if (input.action === "configure_webhook") {
      if (isCron) return reply(req, { error: "Forbidden" }, 403);
      if (config.webhook_endpoint_id)
        return reply(req, {
          configured: true,
          endpoint_id: config.webhook_endpoint_id,
        });
      const params = new URLSearchParams({
        url: `${url}/functions/v1/admin-gym-orders`,
        description: "Fitliner gym module orders",
        api_version: "2025-02-24.acacia",
      });
      for (const event of [
        "checkout.session.completed",
        "checkout.session.expired",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
        "charge.refunded",
        "charge.dispute.created",
        "charge.dispute.closed",
      ])
        params.append("enabled_events[]", event);
      const endpoint = await stripe(
        "/webhook_endpoints",
        params,
        "fitliner-gym-admin-webhook-v1",
      );
      await saveState({
        webhook_endpoint_id: endpoint.id,
        webhook_secret: endpoint.secret,
      });
      return reply(req, { configured: true, endpoint_id: endpoint.id });
    }
    if (input.action !== "sync")
      return reply(req, { error: "Invalid action" }, 400);
    let cursor = config.sync_cursor;
    let imported = 0;
    let more = false;
    // Bounded, resumable pages. Cursor is committed only once a whole page is safely imported.
    for (let page = 0; page < 2; page++) {
      const params = new URLSearchParams({
        payment_link: PAYMENT_LINK,
        limit: "50",
      });
      if (cursor) params.set("starting_after", cursor);
      const sessions = await stripe(`/checkout/sessions?${params}`);
      for (let i = 0; i < sessions.data.length; i += 5) {
        const results = await Promise.all(
          sessions.data
            .slice(i, i + 5)
            .map((s: { id: string }) => importSession(s.id)),
        );
        imported += results.filter(Boolean).length;
      }
      more = sessions.has_more;
      cursor = more ? sessions.data.at(-1)?.id : null;
      await saveState({ sync_cursor: cursor });
      if (!more) break;
    }
    await saveState({
      ...(more ? {} : { last_success_at: new Date().toISOString() }),
      last_error: null,
      imported_count: config.imported_count + imported,
    });
    EdgeRuntime.waitUntil(notifyPaidOrders());
    return reply(req, { imported, has_more: more });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Synchronizácia zlyhala.";
    if (authorized) {
      try {
        await saveState({ last_error: message });
      } catch {
        /* preserve original error */
      }
    }
    return reply(req, { error: message }, 500);
  }
});
