import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

import { HttpError, requireEnv } from "../_shared/fitliner_payments.ts";

const ALLOWED_LOCALES = new Set(["en", "sk", "de", "es", "fr", "zh-Hans"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ATTRIBUTION_KEYS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
]);

function allowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && (
      url.hostname === "befitliner.com" ||
      url.hostname === "www.befitliner.com" ||
      url.hostname.endsWith(".vercel.app")
    ) || url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

function headers(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin(origin) ? origin : "https://befitliner.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
}

function reply(req: Request, body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: headers(req) });
}

function attribution(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const clean: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!ATTRIBUTION_KEYS.has(key) || typeof raw !== "string") continue;
    const normalized = raw.trim().slice(0, 200);
    if (normalized) clean[key] = normalized;
  }
  return clean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: headers(req) });
  if (req.method !== "POST") return reply(req, { error: "Method not allowed" }, 405);

  try {
    const origin = req.headers.get("origin");
    if (origin && !allowedOrigin(origin)) throw new HttpError(403, "Origin is not allowed");

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    const requestId = String(body?.request_id ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const localeValue = String(body?.locale ?? "en").trim();
    const locale = ALLOWED_LOCALES.has(localeValue) ? localeValue : "en";
    const action = String(body?.action ?? "").trim();
    const answers = body?.answers;
    const sourceUrl = String(body?.source_url ?? "").trim().slice(0, 2000) || null;
    const marketingConsent = body?.marketing_consent === true;

    if (!UUID_RE.test(requestId)) throw new HttpError(400, "Valid request_id is required");
    if (!EMAIL_RE.test(email) || email.length > 320) throw new HttpError(400, "Valid email is required");

    const admin = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (action === "claim_exit_offer") {
      const { data: submission, error: submissionError } = await admin
        .from("health_web_funnel_submissions")
        .select("id,email,status,discount_token,discount_expires_at")
        .eq("request_id", requestId)
        .maybeSingle();
      if (submissionError) throw new Error(`Offer lookup failed: ${submissionError.message}`);
      if (!submission || submission.email !== email) throw new HttpError(404, "Lead was not found");
      if (["completed", "already_active"].includes(submission.status)) {
        throw new HttpError(409, "Health is already active");
      }
      const existingExpiry = submission.discount_expires_at
        ? new Date(submission.discount_expires_at).getTime()
        : 0;
      if (existingExpiry && existingExpiry <= Date.now()) {
        throw new HttpError(410, "This offer has expired");
      }
      const expiresAt = existingExpiry
        ? new Date(existingExpiry).toISOString()
        : new Date(Date.now() + 48 * 3_600_000).toISOString();
      if (!existingExpiry) {
        const { error: updateError } = await admin
          .from("health_web_funnel_submissions")
          .update({ discount_expires_at: expiresAt })
          .eq("id", submission.id);
        if (updateError) throw new Error(`Offer activation failed: ${updateError.message}`);
      }
      return reply(req, {
        ok: true,
        offer_token: submission.discount_token,
        expires_at: expiresAt,
      });
    }

    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      throw new HttpError(400, "Questionnaire answers are required");
    }
    if (JSON.stringify(answers).length > 16_000) throw new HttpError(413, "Questionnaire is too large");
    if (body?.health_data_consent !== true || body?.privacy_consent !== true) {
      throw new HttpError(400, "Required consents are missing");
    }

    const { data: existing, error: lookupError } = await admin
      .from("health_web_funnel_submissions")
      .select("email,status")
      .eq("request_id", requestId)
      .maybeSingle();
    if (lookupError) throw new Error(`Lead lookup failed: ${lookupError.message}`);
    if (existing?.email && existing.email !== email) {
      throw new HttpError(409, "This funnel session belongs to another email");
    }
    if (existing && ["checkout_open", "completed", "already_active"].includes(existing.status)) {
      return reply(req, { ok: true, preserved_status: existing.status });
    }
    const now = new Date().toISOString();
    const { error } = await admin.from("health_web_funnel_submissions").upsert({
      request_id: requestId,
      email,
      locale,
      answers,
      source_url: sourceUrl,
      attribution: attribution(body?.attribution),
      health_data_consent: true,
      privacy_consent: true,
      terms_accepted: false,
      marketing_consent: marketingConsent,
      marketing_tracking_consent: false,
      health_data_consent_at: now,
      marketing_consent_at: marketingConsent ? now : null,
      campaign_eligible_at: marketingConsent ? now : null,
      marketing_unsubscribed_at: null,
      last_completed_step: 9,
      status: "lead_captured",
    }, { onConflict: "request_id" });
    if (error) throw new Error(`Lead persistence failed: ${error.message}`);

    return reply(req, { ok: true });
  } catch (error) {
    console.error("Health lead capture failed", error);
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : "Unable to save lead";
    return reply(req, { error: message }, status);
  }
});
