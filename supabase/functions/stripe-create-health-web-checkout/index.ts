import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

import {
  HttpError,
  requireEnv,
  stripeRequest,
} from "../_shared/fitliner_payments.ts";

type CheckoutSession = {
  id: string;
  url?: string | null;
  expires_at?: number | null;
};

type StripeCoupon = {
  id: string;
  duration?: string | null;
  percent_off?: number | null;
  valid?: boolean;
};

const ALLOWED_LOCALES = new Set(["en", "sk", "de", "es", "fr", "zh-Hans"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ATTRIBUTION_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
]);

function sanitizedAttribution(
  value: unknown,
  marketingTrackingConsent: boolean,
): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!ATTRIBUTION_KEYS.has(key) || typeof raw !== "string") continue;
    if (key === "fbclid" && !marketingTrackingConsent) continue;
    const normalized = raw.trim().slice(0, key === "fbclid" ? 250 : 200);
    if (normalized) result[key] = normalized;
  }
  return result;
}

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

function isProductionOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && (
      url.hostname === "befitliner.com" ||
      url.hostname === "www.befitliner.com"
    );
  } catch {
    return false;
  }
}

function responseHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin(origin)
      ? origin
      : "https://befitliner.com",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function reply(req: Request, body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(req),
  });
}

function publicBaseUrl(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  if (allowedOrigin(origin)) return origin;
  return Deno.env.get("HEALTH_WEB_ORIGIN")?.trim() || "https://befitliner.com";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: responseHeaders(req) });
  }
  if (req.method !== "POST") return reply(req, { error: "Method not allowed" }, 405);

  try {
    const requestOrigin = req.headers.get("origin");
    if (requestOrigin && !allowedOrigin(requestOrigin)) {
      throw new HttpError(403, "Origin is not allowed");
    }

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    const requestId = String(body?.request_id ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const localeValue = String(body?.locale ?? "en").trim();
    const locale = ALLOWED_LOCALES.has(localeValue) ? localeValue : "en";
    const answers = body?.answers;
    const sourceUrl = String(body?.source_url ?? "").trim().slice(0, 2000) || null;
    const marketingTrackingConsent = body?.marketing_tracking_consent === true;
    const offerToken = String(body?.offer_token ?? "").trim();
    const offerRequested = offerToken.length > 0;
    const attribution = sanitizedAttribution(
      body?.attribution,
      marketingTrackingConsent,
    );

    if (!UUID_RE.test(requestId)) throw new HttpError(400, "Valid request_id is required");
    if (!EMAIL_RE.test(email) || email.length > 320) {
      throw new HttpError(400, "Valid email is required");
    }
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      throw new HttpError(400, "Questionnaire answers are required");
    }
    if (JSON.stringify(answers).length > 16_000) {
      throw new HttpError(413, "Questionnaire is too large");
    }
    if (
      body?.health_data_consent !== true ||
      body?.privacy_consent !== true ||
      body?.terms_accepted !== true
    ) {
      throw new HttpError(400, "Required consents are missing");
    }

    const admin = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount, error: rateError } = await admin
      .from("health_web_funnel_submissions")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneHourAgo);
    if (rateError) throw new Error(`Rate limit lookup failed: ${rateError.message}`);
    if ((recentCount ?? 0) >= 5) {
      throw new HttpError(429, "Too many checkout attempts. Try again later");
    }

    const { data: existingSubmission, error: existingSubmissionError } = await admin
      .from("health_web_funnel_submissions")
      .select("id,user_id,checkout_attempt_id,status,discount_token,discount_expires_at")
      .eq("request_id", requestId)
      .maybeSingle();
    if (existingSubmissionError) {
      throw new Error(`Submission lookup failed: ${existingSubmissionError.message}`);
    }

    const discountedOffer = UUID_RE.test(offerToken) &&
      existingSubmission?.discount_token === offerToken &&
      Boolean(existingSubmission.discount_expires_at) &&
      new Date(existingSubmission.discount_expires_at).getTime() > Date.now();

    // Never silently downgrade a claimed VIP checkout to the standard price.
    // The client must receive an error instead of a full-price Stripe session.
    if (offerRequested && !discountedOffer) {
      throw new HttpError(409, "This discount offer is invalid or has expired");
    }

    if (existingSubmission?.checkout_attempt_id && !discountedOffer) {
      const { data: existingAttempt, error: attemptLookupError } = await admin
        .from("health_subscription_checkout_attempts")
        .select("provider_checkout_id,provider_account_id")
        .eq("id", existingSubmission.checkout_attempt_id)
        .maybeSingle();
      if (attemptLookupError) {
        throw new Error(`Checkout lookup failed: ${attemptLookupError.message}`);
      }
      if (existingAttempt?.provider_checkout_id) {
        const existingSession = await stripeRequest<CheckoutSession>(
          "GET",
          `/v1/checkout/sessions/${encodeURIComponent(existingAttempt.provider_checkout_id)}`,
          undefined,
          {
            connectedAccountId: existingAttempt.provider_account_id === "platform"
              ? undefined
              : existingAttempt.provider_account_id,
            secretKeyEnv: existingAttempt.provider_account_id === "platform"
              ? isProductionOrigin(req.headers.get("origin") ?? "")
                ? "HEALTH_STRIPE_LIVE_SECRET_KEY"
                : "HEALTH_STRIPE_SECRET_KEY"
              : "STRIPE_SECRET_KEY",
          },
        );
        if (existingSession.url) {
          return reply(req, {
            ok: true,
            reused: true,
            checkout_url: existingSession.url,
            expires_at: existingSession.expires_at ?? null,
          });
        }
      }
    }

    const { data: foundUserId, error: findUserError } = await admin
      .rpc("find_auth_user_id_by_email", { p_email: email });
    if (findUserError) throw new Error(`User lookup failed: ${findUserError.message}`);

    let userId = typeof foundUserId === "string" ? foundUserId : "";
    if (!userId) {
      const { data: created, error: createUserError } = await admin.auth.admin
        .createUser({
          email,
          email_confirm: false,
          user_metadata: { fitliner_onboarding_source: "health_web" },
        });
      if (createUserError || !created.user) {
        const { data: racedUserId } = await admin
          .rpc("find_auth_user_id_by_email", { p_email: email });
        userId = typeof racedUserId === "string" ? racedUserId : "";
        if (!userId) {
          throw new Error(`Account preparation failed: ${createUserError?.message ?? "unknown"}`);
        }
      } else {
        userId = created.user.id;
      }
    }

    const { data: featureEnabled, error: featureError } = await admin
      .rpc("feature_enabled_for_user", {
        p_feature_key: "health_card",
        p_user_id: userId,
      });
    if (featureError) throw new Error(`Feature lookup failed: ${featureError.message}`);
    if (featureEnabled !== true) throw new HttpError(404, "Health Card is not available yet");

    const { data: existingAccess, error: entitlementError } = await admin
      .rpc("has_active_health_card_entitlement", {
        p_user_id: userId,
        p_at: new Date().toISOString(),
      });
    if (entitlementError) {
      throw new Error(`Entitlement lookup failed: ${entitlementError.message}`);
    }

    const submissionPayload = {
      request_id: requestId,
      user_id: userId,
      email,
      locale,
      answers,
      source_url: sourceUrl,
      health_data_consent: true,
      privacy_consent: true,
      terms_accepted: true,
      marketing_consent: body?.marketing_consent === true,
      marketing_tracking_consent: marketingTrackingConsent,
      attribution,
      status: existingAccess === true ? "already_active" : "started",
      last_completed_step: 11,
      checkout_started_at: new Date().toISOString(),
      health_data_consent_at: new Date().toISOString(),
      marketing_consent_at: body?.marketing_consent === true
        ? new Date().toISOString()
        : null,
    };
    const { data: submission, error: submissionError } = await admin
      .from("health_web_funnel_submissions")
      .upsert(submissionPayload, { onConflict: "request_id" })
      .select("id")
      .single();
    if (submissionError || !submission) {
      throw new Error(`Submission persistence failed: ${submissionError?.message ?? "unknown"}`);
    }

    if (existingAccess === true) {
      return reply(req, { ok: true, already_active: true });
    }

    const { data: plans, error: planError } = await admin
      .from("health_subscription_plans")
      .select("id,gym_id,billing_merchant_code,name,stripe_price_id,stripe_test_price_id,stripe_live_price_id,price_minor,currency,interval_unit")
      .eq("active", true)
      .eq("currency", "EUR")
      .eq("interval_unit", "year")
      .eq("price_minor", 3480)
      .order("sort_order", { ascending: true })
      .limit(1);
    if (planError) throw new Error(`Health plan lookup failed: ${planError.message}`);
    const plan = plans?.[0];
    if (!plan) {
      throw new HttpError(409, "Annual Fitliner Health plan is not configured");
    }

    let secretKey = "";
    let secretKeyEnv:
      | "STRIPE_SECRET_KEY"
      | "HEALTH_STRIPE_SECRET_KEY"
      | "HEALTH_STRIPE_LIVE_SECRET_KEY" = "STRIPE_SECRET_KEY";
    let providerAccountId = "";
    let connectedAccountId: string | undefined;
    let feeBps = 0;
    let managedPaymentsEnabled = false;
    let productionRequest = false;
    let stripePriceId = String(plan.stripe_price_id ?? "").trim();

    if (plan.billing_merchant_code) {
      productionRequest = isProductionOrigin(
        req.headers.get("origin") ?? "",
      );
      secretKeyEnv = productionRequest
        ? "HEALTH_STRIPE_LIVE_SECRET_KEY"
        : "HEALTH_STRIPE_SECRET_KEY";
      const { data: merchant, error: merchantError } = await admin
        .from("health_billing_merchants")
        .select("provider,provider_account_id,active,stripe_live_mode_enabled,managed_payments_enabled,managed_payments_sandbox_enabled")
        .eq("code", plan.billing_merchant_code)
        .maybeSingle();
      if (merchantError) {
        throw new Error(`Health merchant lookup failed: ${merchantError.message}`);
      }
      if (!merchant?.active || merchant.provider !== "stripe") {
        throw new HttpError(409, "Health subscription merchant is not ready");
      }
      if (
        productionRequest &&
        (!merchant.stripe_live_mode_enabled || !merchant.managed_payments_enabled)
      ) {
        throw new HttpError(409, "Live Health payments are not enabled");
      }
      secretKey = requireEnv(secretKeyEnv);
      providerAccountId = String(merchant.provider_account_id ?? "").trim();
      if (providerAccountId !== "platform" && !providerAccountId.startsWith("acct_")) {
        throw new HttpError(409, "Health subscription merchant is invalid");
      }
      if (productionRequest) {
        if (!secretKey.startsWith("sk_live_")) {
          throw new HttpError(409, "Live Health payments are not configured");
        }
        const liveTestOnly = (Deno.env.get("HEALTH_LIVE_TEST_ONLY") ?? "")
          .trim().toLowerCase() === "true";
        const liveTestEmail = (Deno.env.get("HEALTH_LIVE_TEST_EMAIL") ?? "")
          .trim().toLowerCase();
        if (liveTestOnly && (!liveTestEmail || email !== liveTestEmail)) {
          throw new HttpError(409, "Live Health payments are in final verification");
        }
        stripePriceId = String(plan.stripe_live_price_id ?? "").trim();
        managedPaymentsEnabled = true;
      } else {
        if (!secretKey.startsWith("sk_test_")) {
          throw new HttpError(409, "Health sandbox payments are not configured");
        }
        stripePriceId = String(plan.stripe_test_price_id ?? "").trim();
        managedPaymentsEnabled = merchant.managed_payments_sandbox_enabled === true;
      }
      connectedAccountId = providerAccountId === "platform"
        ? undefined
        : providerAccountId;
    } else {
      secretKey = requireEnv(secretKeyEnv);
      const { data: connected, error: connectedError } = await admin
        .from("stripe_connected_accounts")
        .select("stripe_account_id,onboarding_status,charges_enabled,payouts_enabled")
        .eq("gym_id", plan.gym_id)
        .maybeSingle();
      if (connectedError) {
        throw new Error(`Stripe account lookup failed: ${connectedError.message}`);
      }
      if (
        !connected?.stripe_account_id ||
        connected.onboarding_status !== "enabled" ||
        !connected.charges_enabled ||
        !connected.payouts_enabled
      ) {
        throw new HttpError(409, "Health subscription payments are not ready");
      }
      const { data: settings, error: settingsError } = await admin
        .from("gym_payment_settings")
        .select("payment_provider,fitliner_fee_bps_override,stripe_live_mode_enabled")
        .eq("gym_id", plan.gym_id)
        .maybeSingle();
      if (settingsError) {
        throw new Error(`Payment settings lookup failed: ${settingsError.message}`);
      }
      if (settings?.payment_provider !== "stripe_connect") {
        throw new HttpError(409, "Stripe Connect is not enabled");
      }
      if (secretKey.startsWith("sk_live_") && !settings.stripe_live_mode_enabled) {
        throw new HttpError(409, "Live payments are not enabled");
      }
      providerAccountId = connected.stripe_account_id;
      connectedAccountId = connected.stripe_account_id;
      feeBps = Number(settings.fitliner_fee_bps_override ?? 1000);
      if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 9999) {
        throw new HttpError(409, "Invalid Fitliner fee configuration");
      }
    }

    if (!stripePriceId.startsWith("price_")) {
      throw new HttpError(409, "Health subscription price is not configured");
    }

    const { data: attempt, error: attemptError } = await admin
      .from("health_subscription_checkout_attempts")
      .insert({
        user_id: userId,
        plan_id: plan.id,
        request_id: discountedOffer ? crypto.randomUUID() : requestId,
        provider_account_id: providerAccountId,
        status: "pending",
      })
      .select("id")
      .single();
    if (attemptError || !attempt) {
      throw new Error(`Checkout attempt failed: ${attemptError?.message ?? "unknown"}`);
    }

    const baseUrl = publicBaseUrl(req);
    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set(
      "success_url",
      `${baseUrl}/${encodeURIComponent(locale)}/health/success?session_id={CHECKOUT_SESSION_ID}`,
    );
    params.set("cancel_url", `${baseUrl}/${encodeURIComponent(locale)}/health?checkout=cancelled`);
    params.set("billing_address_collection", "required");
    params.set("locale", "auto");
    params.set("submit_type", "subscribe");
    params.set("line_items[0][price]", stripePriceId);
    params.set("line_items[0][quantity]", "1");
    params.set("customer_email", email);
    params.set("client_reference_id", attempt.id);
    if (managedPaymentsEnabled) {
      params.set("managed_payments[enabled]", "true");
    } else if (providerAccountId === "platform") {
      params.set("automatic_tax[enabled]", "true");
      params.set("tax_id_collection[enabled]", "true");
    }
    const liveTestEmail = (Deno.env.get("HEALTH_LIVE_TEST_EMAIL") ?? "")
      .trim().toLowerCase();
    const liveTestCouponId = (Deno.env.get("HEALTH_LIVE_TEST_COUPON_ID") ?? "")
      .trim();
    if (
      productionRequest &&
      email === liveTestEmail &&
      /^[A-Za-z0-9_-]{1,255}$/.test(liveTestCouponId)
    ) {
      params.set("discounts[0][coupon]", liveTestCouponId);
    }
    if (discountedOffer) {
      const couponId = "fitliner_health_vip_50_once_v3";
      let coupon: StripeCoupon | null = null;
      try {
        coupon = await stripeRequest<StripeCoupon>(
          "GET",
          `/v1/coupons/${couponId}`,
          undefined,
          {
            connectedAccountId,
            secretKeyEnv,
          },
        );
      } catch {
        const couponParams = new URLSearchParams();
        couponParams.set("id", couponId);
        couponParams.set("percent_off", "50");
        couponParams.set("duration", "once");
        couponParams.set("name", "Fitliner Health VIP 50% first year");
        coupon = await stripeRequest<StripeCoupon>(
          "POST",
          "/v1/coupons",
          couponParams,
          {
            connectedAccountId,
            secretKeyEnv,
            idempotencyKey: couponId,
          },
        );
      }
      if (
        !coupon ||
        coupon.id !== couponId ||
        coupon.percent_off !== 50 ||
        coupon.duration !== "once" ||
        coupon.valid === false
      ) {
        throw new HttpError(409, "The Fitliner Health VIP discount is not configured correctly");
      }
      params.set("discounts[0][coupon]", couponId);
      params.set("metadata[fitliner_health_offer]", "abandoned_50_first_year");
      params.set("subscription_data[metadata][fitliner_health_offer]", "abandoned_50_first_year");
      params.set("subscription_data[metadata][fitliner_health_initial_price_minor]", "1740");
    } else {
      params.set("subscription_data[metadata][fitliner_health_initial_price_minor]", "3480");
    }
    params.set("metadata[fitliner_health_plan_id]", plan.id);
    params.set("metadata[fitliner_health_user_id]", userId);
    params.set("metadata[fitliner_health_checkout_id]", attempt.id);
    params.set("metadata[fitliner_health_web_submission_id]", submission.id);
    params.set("subscription_data[metadata][fitliner_health_plan_id]", plan.id);
    params.set("subscription_data[metadata][fitliner_health_user_id]", userId);
    params.set("subscription_data[metadata][fitliner_health_checkout_id]", attempt.id);
    params.set("subscription_data[metadata][fitliner_health_web_submission_id]", submission.id);
    if (feeBps > 0) {
      params.set("subscription_data[application_fee_percent]", (feeBps / 100).toFixed(2));
    }

    let session: CheckoutSession;
    try {
      session = await stripeRequest<CheckoutSession>(
        "POST",
        "/v1/checkout/sessions",
        params,
        {
          connectedAccountId,
          idempotencyKey: `fitliner-health-web-${attempt.id}`,
          secretKeyEnv,
          stripeVersion: managedPaymentsEnabled
            ? "2025-03-31.basil"
            : undefined,
        },
      );
    } catch (error) {
      await Promise.all([
        admin.from("health_subscription_checkout_attempts")
          .update({ status: "failed" }).eq("id", attempt.id),
        admin.from("health_web_funnel_submissions")
          .update({ status: "failed", checkout_attempt_id: attempt.id })
          .eq("id", submission.id),
      ]);
      throw error;
    }
    if (!session.url) throw new Error("Stripe did not return a Checkout URL");

    const [attemptUpdate, submissionUpdate] = await Promise.all([
      admin.from("health_subscription_checkout_attempts")
        .update({ provider_checkout_id: session.id, status: "open" })
        .eq("id", attempt.id),
      admin.from("health_web_funnel_submissions")
        .update({ status: "checkout_open", checkout_attempt_id: attempt.id })
        .eq("id", submission.id),
    ]);
    if (attemptUpdate.error || submissionUpdate.error) {
      throw new Error("Checkout persistence failed");
    }

    return reply(req, {
      ok: true,
      reused: false,
      discount_applied: discountedOffer,
      initial_price_minor: discountedOffer ? 1740 : 3480,
      checkout_url: session.url,
      expires_at: session.expires_at ?? null,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return reply(req, { error: error.message }, error.status);
    }
    console.error("Health web checkout failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return reply(req, { error: "Internal server error" }, 500);
  }
});
