import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, HttpError, jsonResponse, requireAuthenticated, requireEnv } from "../_shared/fitliner_payments.ts";
import { proStripeConfig, proStripeRequest, verifyProStripeAccount } from "../_shared/fitliner_pro_stripe.ts";

import { ensureProCoupon } from "../_shared/fitliner_pro_coupon.ts";

const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;

const plans = {
  monthly: { code: "fitliner_pro_monthly_eur", amount: 700, interval: "month" },
  annual: { code: "fitliner_pro_annual_eur", amount: 3600, interval: "year" },
} as const;

type StripePrice = {
  active: boolean;
  livemode: boolean;
  currency: string;
  product: string;
  unit_amount: number;
  tax_behavior: string;
  recurring: { interval: string; interval_count: number } | null;
};
type Session = { id: string; url: string | null; status: string; livemode: boolean };

serve(async (req) => {
  const allowedOrigin = Deno.env.get("FITLINER_PRO_WEB_ORIGIN")?.trim();
  const origin = req.headers.get("origin");
  const headers = new Headers(corsHeaders);
  headers.delete("Access-Control-Allow-Origin");
  headers.set("Vary", "Origin");
  if (origin && origin === allowedOrigin) headers.set("Access-Control-Allow-Origin", origin);
  if (origin && origin !== allowedOrigin) return new Response(null, { status: 403, headers });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  function reply(body: unknown, status = 200) {
    const response = jsonResponse(body, status);
    response.headers.delete("Access-Control-Allow-Origin");
    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const config = proStripeConfig(requireEnv("SUPABASE_URL"));
    const site = new URL(requireEnv("FITLINER_PRO_WEB_ORIGIN"));
    const productionSite = site.hostname === "www.befitliner.com" || site.hostname === "befitliner.com";
    if (site.protocol !== "https:" || (config.live ? site.origin !== "https://www.befitliner.com" : productionSite)) {
      throw new HttpError(503, "Checkout unavailable");
    }
    const body = await req.json().catch(() => null);
    const selected = body?.plan === "monthly" ? plans.monthly : body?.plan === "annual" ? plans.annual : null;
    if (!selected) throw new HttpError(400, "Invalid plan");

    const caller = await requireAuthenticated(req);
    if (!caller.userEmail || !caller.userEmailVerified) throw new HttpError(403, "Verified email required");

    const flowId = typeof body.flow_id === "string" && uuid.test(body.flow_id) ? body.flow_id : null;
    if ((body.flow_id != null && !flowId) || (body.offer_token != null && !flowId)) {
      throw new HttpError(400, "Invalid profile reference");
    }
    let discount: 0 | 20 | 30 = 0;
    if (flowId) {
      const lead = await caller.admin.from("fitliner_pro_funnel")
        .select("id,purchased_at").eq("id", flowId).eq("user_id", caller.userId)
        .eq("email", caller.userEmail.toLowerCase()).not("verified_at", "is", null).maybeSingle();
      if (lead.error) throw lead.error;
      if (!lead.data) throw new HttpError(403, "Verified profile required");
      if (lead.data.purchased_at) return reply({ already_active: true });
      if (body.offer_token != null) {
        if (typeof body.offer_token !== "string" || !uuid.test(body.offer_token)) throw new HttpError(400, "Invalid offer");
        const offer = await caller.admin.from("fitliner_pro_funnel_mail")
          .select("sequence").eq("funnel_id", flowId).eq("token", body.offer_token)
          .eq("status", "sent").gt("sent_at", new Date(Date.now() - 7 * 86400000).toISOString()).maybeSingle();
        if (offer.error) throw offer.error;
        if (offer.data?.sequence !== 2 && offer.data?.sequence !== 3) throw new HttpError(409, "Expired offer");
        discount = offer.data.sequence === 2 ? 20 : 30;
      }
    }

    const { data: plan, error: planError } = await caller.admin
      .from("health_subscription_plans")
      .select("id,price_minor,currency,interval_unit,stripe_test_price_id,stripe_live_price_id")
      .eq("code", selected.code).eq("active", true).eq("billing_merchant_code", "globalio_llc").maybeSingle();
    if (planError) throw planError;
    const priceId = config.live ? plan?.stripe_live_price_id : plan?.stripe_test_price_id;
    if (!/^price_[A-Za-z0-9]+$/.test(priceId ?? "") || Number(plan.price_minor) !== selected.amount ||
      plan.currency !== "EUR" || plan.interval_unit !== selected.interval) throw new HttpError(503, "Plan unavailable");

    await verifyProStripeAccount(config);
    const price = await proStripeRequest<StripePrice>(config, `/v1/prices/${priceId}`);
    if (!price.active || price.livemode !== config.live || price.product !== config.productId || price.currency !== "eur" || price.unit_amount !== selected.amount ||
      price.tax_behavior !== "inclusive" || price.recurring?.interval !== selected.interval ||
      price.recurring.interval_count !== 1) throw new HttpError(503, "Stripe price does not match plan");

    const reservation = flowId
      ? caller.admin.rpc("reserve_fitliner_pro_funnel_checkout", {
        p_user_id: caller.userId, p_plan_id: plan.id, p_discount: discount,
      })
      : caller.admin.rpc("reserve_fitliner_pro_checkout", { p_user_id: caller.userId, p_plan_id: plan.id });
    const { data: attempt, error: reserveError } = await reservation.maybeSingle();
    if (reserveError) throw reserveError;
    if (!attempt) return reply({ already_active: true });
    if (attempt.plan_id !== plan.id || (attempt.fitliner_pro_discount ?? 0) !== discount) throw new HttpError(409, "Another plan already has an open checkout");

    let session: Session;
    if (attempt.provider_checkout_id) {
      session = await proStripeRequest<Session>(config, `/v1/checkout/sessions/${encodeURIComponent(attempt.provider_checkout_id)}`);
    } else {
      const expiresAt = Math.floor(new Date(attempt.created_at).getTime() / 1000) + 36 * 60;
      const success = new URL("/sk/zacat?pro=returned", site);
      const cancel = new URL(`/sk/zacat?pro=${body.plan}`, site);
      if (flowId) {
        success.searchParams.set("flow", flowId);
        cancel.searchParams.set("flow", flowId);
        if (discount) cancel.searchParams.set("offer", body.offer_token);
      }
      const params = new URLSearchParams({
        mode: "subscription",
        customer_email: caller.userEmail,
        client_reference_id: attempt.id,
        billing_address_collection: "required",
        locale: "sk",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        expires_at: String(expiresAt),
        success_url: success.href,
        cancel_url: cancel.href,
      });
      if (config.live) {
        params.set("managed_payments[enabled]", "true");
      } else {
        params.set("automatic_tax[enabled]", "true");
        params.set("adaptive_pricing[enabled]", "false");
      }
      if (discount) params.set("discounts[0][coupon]", await ensureProCoupon(config, discount));
      for (const [key, value] of Object.entries({
        fitliner_pro_plan_id: plan.id,
        fitliner_pro_user_id: caller.userId,
        fitliner_pro_checkout_id: attempt.id,
      })) {
        params.set(`metadata[${key}]`, value);
        params.set(`subscription_data[metadata][${key}]`, value);
      }
      session = await proStripeRequest<Session>(config, "/v1/checkout/sessions", params, `fitliner-pro-${attempt.id}`);
      const { error: updateError } = await caller.admin.from("health_subscription_checkout_attempts")
        .update({ status: "open", provider_checkout_id: session.id }).eq("id", attempt.id).eq("status", "pending");
      if (updateError) throw updateError;
    }
    if (session.livemode !== config.live || session.status !== "open" || !session.url ||
      new URL(session.url).origin !== "https://checkout.stripe.com") throw new HttpError(409, "Checkout is no longer open");
    if (flowId) {
      const { error } = await caller.admin.from("fitliner_pro_funnel").update({ step: 9, last_seen_at: new Date().toISOString() })
        .eq("id", flowId).eq("user_id", caller.userId).lt("step", 9);
      if (error) throw error;
    }
    return reply({ checkout_url: session.url });
  } catch (error) {
    if (error instanceof HttpError) {
      return reply({ error: error.status === 409 ? "checkout_conflict" : "checkout_unavailable" }, error.status);
    }
    console.error("Fitliner PRO checkout failed", error instanceof Error ? error.name : "Database error");
    return reply({ error: "checkout_unavailable" }, 500);
  }
});
