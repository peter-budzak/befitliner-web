import { HttpError, requireEnv } from "./fitliner_payments.ts";

export function proStripeConfig(supabaseUrl: string) {
  const host = new URL(supabaseUrl).hostname;
  const mode = Deno.env.get("FITLINER_PRO_CHECKOUT_MODE");
  const live = host === "jkjncktexqqkrmezdjui.supabase.co" && mode === "live";
  const test = host === "xguwwicyqhuutcgkpsyh.supabase.co" && mode === "test";
  if (!live && !test) throw new HttpError(503, "Fitliner PRO payments unavailable");

  const key = requireEnv(live ? "HEALTH_STRIPE_LIVE_SECRET_KEY" : "STRIPE_SECRET_KEY");
  const webhookSecret = requireEnv(live ? "FITLINER_PRO_LIVE_WEBHOOK_SECRET" : "FITLINER_PRO_TEST_WEBHOOK_SECRET");
  if (!(live ? /^(sk|rk)_live_/ : /^(sk|rk)_test_/).test(key) || !webhookSecret.startsWith("whsec_")) {
    throw new HttpError(503, "Fitliner PRO payments unavailable");
  }

  return {
    live,
    key,
    webhookSecret,
    accountId: live ? "acct_1Txll7CfokQQFj5m" : "acct_1TwScHCrNliycFwp",
    productId: live ? "prod_VbpJYKBOpxp1GK" : "prod_VbotTDQiavIDSu",
  };
}

export async function proStripeRequest<T>(
  config: ReturnType<typeof proStripeConfig>,
  path: string,
  params?: URLSearchParams,
  idempotencyKey?: string,
): Promise<T> {
  const headers = new Headers({
    Authorization: `Bearer ${config.key}`,
    "Stripe-Version": "2025-03-31.basil",
  });
  if (params) headers.set("Content-Type", "application/x-www-form-urlencoded");
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  const response = await fetch(`https://api.stripe.com${path}`, {
    method: params ? "POST" : "GET",
    headers,
    body: params,
  });
  if (!response.ok) throw new HttpError(502, "Stripe request failed");
  return await response.json() as T;
}

export async function verifyProStripeAccount(config: ReturnType<typeof proStripeConfig>) {
  const account = await proStripeRequest<{ id: string }>(config, "/v1/account");
  if (account.id !== config.accountId) throw new HttpError(503, "Unexpected Stripe account");
}
