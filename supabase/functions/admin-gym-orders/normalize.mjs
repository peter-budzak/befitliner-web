export const PAYMENT_LINK = "plink_1UEWG3CqeksGlIZjRnsiUZuZ";
export const STRIPE_ACCOUNT = "acct_1TwSc8CqeksGlIZj";
export const PRODUCT = "prod_VF01Wax9OaUYpo";
export function normalizeOrder(session, items, charge, observedAt) {
  if (session.payment_link !== PAYMENT_LINK || session.livemode !== true)
    throw new Error("Unexpected payment link or mode");
  if (
    items.has_more ||
    !items.data?.length ||
    items.data.some(
      (item) =>
        (typeof item.price?.product === "string"
          ? item.price.product
          : item.price?.product?.id) !== PRODUCT,
    )
  )
    throw new Error("Unexpected order product");
  const quantity = items.data.reduce((sum, item) => sum + item.quantity, 0);
  if (!Number.isInteger(quantity) || quantity <= 0)
    throw new Error("Invalid quantity");
  const amount = session.amount_total;
  const refunded = charge?.amount_refunded || 0;
  if (!Number.isSafeInteger(amount) || amount < 0 || refunded > amount)
    throw new Error("Invalid order amount");
  const paid = session.payment_status === "paid" && charge?.paid === true;
  let status = paid
    ? "paid"
    : session.status === "expired"
      ? "expired"
      : session.status === "complete"
        ? "processing"
        : "unpaid";
  if (paid && refunded > 0)
    status = refunded === amount ? "refunded" : "partially_refunded";
  if (paid && charge?.disputed) status = "disputed";
  return {
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null,
    customer_name: session.customer_details?.name || null,
    customer_email:
      session.customer_details?.email || session.customer_email || null,
    customer_phone: session.customer_details?.phone || null,
    shipping_address:
      session.collected_information?.shipping_details ||
      session.shipping_details ||
      {},
    quantity,
    amount_minor: amount,
    refunded_minor: refunded,
    currency: session.currency.toUpperCase(),
    payment_status: status,
    created_at: new Date(session.created * 1000).toISOString(),
    paid_at:
      paid && charge?.created
        ? new Date(charge.created * 1000).toISOString()
        : null,
    synced_at: observedAt,
  };
}
export async function verifySignature(body, header, secret, now = Date.now()) {
  const parts = header.split(",").map((p) => p.split("="));
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  if (
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  )
    return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  for (const [kind, signature] of parts) {
    if (kind !== "v1" || !/^[a-f0-9]{64}$/i.test(signature || "")) continue;
    const bytes = Uint8Array.from(signature.match(/../g), (hex) =>
      parseInt(hex, 16),
    );
    if (
      await crypto.subtle.verify(
        "HMAC",
        key,
        bytes,
        new TextEncoder().encode(`${timestamp}.${body}`),
      )
    )
      return true;
  }
  return false;
}
