import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

export const FUNCTION_VERSION = "fitliner-payments@2026-07-24-1";

export const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(body: unknown, status = 200): Response {
  const data = body !== null && typeof body === "object" && !Array.isArray(body)
    ? { _v: FUNCTION_VERSION, ...(body as Record<string, unknown>) }
    : { _v: FUNCTION_VERSION, data: body };

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function requireEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export type OwnerContext = {
  userId: string;
  userEmail: string | null;
  // Database types are generated only after the new migrations are applied.
  // Keep this service-role client intentionally untyped at the shared boundary;
  // Stripe request/response payloads and all public inputs remain explicitly
  // validated below and in the database RPCs.
  admin: any;
};

export async function requireAuthenticated(
  req: Request,
): Promise<OwnerContext> {
  const token = bearerToken(req);
  if (!token) throw new HttpError(401, "Missing authorization header");

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const anonKey = requireEnv("SUPABASE_ANON_KEY");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin: any = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userResult, error: userError } = await authClient.auth
    .getUser();
  if (userError || !userResult.user) {
    throw new HttpError(401, "Unauthorized");
  }

  return {
    userId: userResult.user.id,
    userEmail: userResult.user.email ?? null,
    admin,
  };
}

export async function requireGymOwner(
  req: Request,
  gymId: string,
): Promise<OwnerContext> {
  const authenticated = await requireAuthenticated(req);
  const { admin } = authenticated;

  const { data: gym, error: gymError } = await admin
    .from("gyms")
    .select("id,owner_id")
    .eq("id", gymId)
    .maybeSingle();

  if (gymError) throw new Error(`Gym lookup failed: ${gymError.message}`);
  if (!gym || gym.owner_id !== authenticated.userId) {
    throw new HttpError(403, "Only the gym owner can manage payments");
  }

  return authenticated;
}

export async function requireFitlinerAdmin(
  req: Request,
): Promise<OwnerContext> {
  const authenticated = await requireAuthenticated(req);
  const { data: profile, error: profileError } = await authenticated.admin
    .from("profiles")
    .select("role")
    .eq("id", authenticated.userId)
    .maybeSingle();
  if (profileError) {
    throw new Error(`Admin role lookup failed: ${profileError.message}`);
  }
  if (profile?.role !== "admin") {
    throw new HttpError(403, "Fitliner administrator access is required");
  }
  return authenticated;
}

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

type StripeRequestOptions = {
  connectedAccountId?: string;
  idempotencyKey?: string;
  stripeVersion?: string;
  secretKeyEnv?:
    | "STRIPE_SECRET_KEY"
    | "HEALTH_STRIPE_SECRET_KEY"
    | "HEALTH_STRIPE_LIVE_SECRET_KEY";
};

export async function stripeRequest<T>(
  method: "GET" | "POST",
  path: string,
  params?: URLSearchParams,
  options: StripeRequestOptions = {},
): Promise<T> {
  const stripeSecretKey = requireEnv(
    options.secretKeyEnv ?? "STRIPE_SECRET_KEY",
  );
  const headers = new Headers({
    Authorization: `Bearer ${stripeSecretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  });

  if (options.connectedAccountId) {
    headers.set("Stripe-Account", options.connectedAccountId);
  }
  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }
  if (options.stripeVersion) {
    headers.set("Stripe-Version", options.stripeVersion);
  }

  const response = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers,
    body: method === "POST" ? (params ?? new URLSearchParams()) : undefined,
  });

  const payload = await response.json().catch(() => null) as
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    const stripeError = payload?.error as Record<string, unknown> | undefined;
    const message = typeof stripeError?.message === "string"
      ? stripeError.message
      : `Stripe request failed with HTTP ${response.status}`;
    throw new HttpError(
      response.status >= 400 && response.status < 500 ? 400 : 502,
      message,
    );
  }

  return payload as T;
}

export const STRIPE_ACCOUNTS_V2_VERSION = "2026-06-24.dahlia";

export async function stripeV2Request<T>(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>,
  options: Pick<StripeRequestOptions, "idempotencyKey"> = {},
): Promise<T> {
  const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");
  const headers = new Headers({
    Authorization: `Bearer ${stripeSecretKey}`,
    "Content-Type": "application/json",
    "Stripe-Version": STRIPE_ACCOUNTS_V2_VERSION,
  });
  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }

  const response = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
  });

  const payload = await response.json().catch(() => null) as
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    const stripeError = payload?.error as Record<string, unknown> | undefined;
    const v2Errors = Array.isArray(payload?.errors)
      ? payload.errors as Array<Record<string, unknown>>
      : [];
    const message = typeof stripeError?.message === "string"
      ? stripeError.message
      : typeof v2Errors[0]?.message === "string"
      ? v2Errors[0].message
      : `Stripe request failed with HTTP ${response.status}`;
    throw new HttpError(
      response.status >= 400 && response.status < 500 ? 400 : 502,
      message,
    );
  }

  return payload as T;
}

export type StripeAccount = {
  id: string;
  country?: string | null;
  business_type?: string | null;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  requirements?: {
    currently_due?: string[] | null;
    eventually_due?: string[] | null;
    past_due?: string[] | null;
    disabled_reason?: string | null;
  } | null;
};

export function stripeOnboardingStatus(
  account: StripeAccount,
): "pending" | "onboarding" | "restricted" | "enabled" | "disabled" {
  if (account.charges_enabled && account.payouts_enabled) return "enabled";

  const requirements = account.requirements;
  if (requirements?.disabled_reason) {
    return requirements.disabled_reason.startsWith("rejected.")
      ? "disabled"
      : "restricted";
  }
  if (account.details_submitted) return "restricted";
  return "onboarding";
}

export async function syncStripeAccount(
  admin: any,
  gymId: string,
  account: StripeAccount,
): Promise<void> {
  const requirements = account.requirements ?? {};
  const { error } = await admin.from("stripe_connected_accounts").upsert({
    gym_id: gymId,
    stripe_account_id: account.id,
    country: (account.country ?? "SK").toUpperCase(),
    business_type: account.business_type ?? null,
    onboarding_status: stripeOnboardingStatus(account),
    details_submitted: account.details_submitted ?? false,
    charges_enabled: account.charges_enabled ?? false,
    payouts_enabled: account.payouts_enabled ?? false,
    requirements_currently_due: requirements.currently_due ?? [],
    requirements_eventually_due: requirements.eventually_due ?? [],
    requirements_past_due: requirements.past_due ?? [],
    disabled_reason: requirements.disabled_reason ?? null,
    last_synced_at: new Date().toISOString(),
  }, { onConflict: "gym_id" });

  if (error) throw new Error(`Stripe account sync failed: ${error.message}`);
}

export function publicStripeAccount(account: StripeAccount) {
  return {
    stripe_account_id: account.id,
    country: account.country ?? null,
    business_type: account.business_type ?? null,
    onboarding_status: stripeOnboardingStatus(account),
    details_submitted: account.details_submitted ?? false,
    charges_enabled: account.charges_enabled ?? false,
    payouts_enabled: account.payouts_enabled ?? false,
    requirements: {
      currently_due: account.requirements?.currently_due ?? [],
      eventually_due: account.requirements?.eventually_due ?? [],
      past_due: account.requirements?.past_due ?? [],
      disabled_reason: account.requirements?.disabled_reason ?? null,
    },
  };
}

export function handleFunctionError(error: unknown): Response {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message }, error.status);
  }
  const message = error instanceof Error ? error.message : String(error);
  console.error("Fitliner Payments function failed", { message });
  return jsonResponse({ error: "Internal server error" }, 500);
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

export async function verifyStripeSignature(
  rawBody: Uint8Array,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<void> {
  if (!signatureHeader) {
    throw new HttpError(400, "Missing Stripe-Signature header");
  }

  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.trim().split("=", 2);
    if (key === "t") timestamp = Number(value);
    if (key === "v1" && value) signatures.push(value);
  }

  if (!timestamp || !Number.isFinite(timestamp) || signatures.length === 0) {
    throw new HttpError(400, "Invalid Stripe signature header");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    throw new HttpError(400, "Expired Stripe webhook signature");
  }

  const prefix = new TextEncoder().encode(`${timestamp}.`);
  const signedPayload = new Uint8Array(prefix.length + rawBody.length);
  signedPayload.set(prefix);
  signedPayload.set(rawBody, prefix.length);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, signedPayload),
  );

  const valid = signatures.some((candidate) => {
    const bytes = hexToBytes(candidate);
    return bytes !== null && timingSafeEqual(expected, bytes);
  });
  if (!valid) throw new HttpError(400, "Invalid Stripe webhook signature");
}
