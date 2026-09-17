// This module accepts an injected fetch for offline tests. No secrets or provider
// response bodies are logged, and no customer contact data is included in the SMS.
export function orderAlertText(order) {
  if (!/^[a-f0-9-]{36}$/i.test(order.order_id) || order.currency !== "EUR" ||
      !Number.isSafeInteger(order.quantity) || order.quantity < 1 ||
      !Number.isSafeInteger(order.amount_minor) || order.amount_minor !== order.quantity * 1500) {
    throw new Error("Invalid paid module order");
  }
  return `Fitliner: Nova zaplatena objednavka modulu. ${order.quantity} ks, ${(order.amount_minor / 100).toFixed(2)} EUR. Objednavka ${order.order_id.slice(0, 8)}. https://admin.befitliner.com`;
}

export function twilioConfig(env) {
  const account = env("GYM_ADMIN_TWILIO_ACCOUNT_SID") || "";
  const key = env("GYM_ADMIN_TWILIO_API_KEY") || "";
  const secret = env("GYM_ADMIN_TWILIO_API_SECRET") || "";
  const sender = env("GYM_ADMIN_SMS_FROM") || "Fitliner";
  if (!/^AC[0-9a-f]{32}$/i.test(account) || !/^SK[0-9a-f]{32}$/i.test(key) ||
      !secret || !/^(?:\+[1-9]\d{7,14}|[A-Za-z][A-Za-z0-9 ]{0,10})$/.test(sender)) return null;
  return { account, key, secret, sender };
}

export function deliveryStatus(status) {
  if (status === "delivered" || status === "read") return "delivered";
  if (["failed", "undelivered", "canceled"].includes(status)) return "failed";
  return "accepted";
}

export async function sendOrderAlert(config, recipient, order, fetcher = fetch) {
  if (!/^\+[1-9]\d{7,14}$/.test(recipient)) throw new Error("Invalid SMS recipient");
  const body = new URLSearchParams({ To: recipient, From: config.sender,
    Body: orderAlertText(order), ValidityPeriod: "3600" });
  try {
    const response = await fetcher(`https://api.twilio.com/2010-04-01/Accounts/${config.account}/Messages.json`, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Basic ${btoa(`${config.key}:${config.secret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded" }, body,
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && /^SM[0-9a-f]{32}$/i.test(data.sid || "")) {
      return { status: deliveryStatus(data.status), provider_sid: data.sid,
        last_error: data.error_code ? `Twilio ${data.error_code}` : null };
    }
    // A 429 explicitly rejects the request before creating a message. Other
    // ambiguous responses must not be retried as another paid send.
    if (response.status === 429 && order.attempts < 5) return {
      status: "pending", available_at: new Date(Date.now() + 15 * 60_000).toISOString(),
      last_error: "SMS služba je vyťažená. Pokus sa zopakuje.",
    };
    const uncertain = response.ok || response.status >= 500 || response.status === 408;
    return { status: uncertain ? "unknown" : "failed",
      last_error: `SMS služba: HTTP ${response.status}${Number.isInteger(data.code) ? `, kód ${data.code}` : ""}.` };
  } catch {
    return { status: "unknown", last_error: "Odoslanie nebolo potvrdené. Overte správu u poskytovateľa." };
  }
}

export async function dispatchOrderAlerts(db, env, fetcher = fetch) {
  const { data: settings, error } = await db.from("gym_admin_alert_settings").select("enabled,recipient").eq("id", true).single();
  if (error) throw new Error("Nastavenie SMS nie je dostupné.");
  if (!settings.enabled) return;
  const config = twilioConfig(env);
  if (!config || !settings.recipient) throw new Error("SMS čaká na pripojenie Twilio a nastavenie príjemcu.");

  // Check delivery receipts without sending another SMS. Acceptance by the API
  // is displayed separately from confirmed delivery by the mobile network.
  const { data: accepted, error: listError } = await db.from("gym_admin_order_alerts")
    .select("id,provider_sid").eq("status", "accepted").order("updated_at").limit(3);
  if (listError) throw new Error("Stav SMS sa nepodarilo načítať.");
  for (const alert of accepted || []) {
    try {
      if (!/^SM[0-9a-f]{32}$/i.test(alert.provider_sid || "")) continue;
      const response = await fetcher(`https://api.twilio.com/2010-04-01/Accounts/${config.account}/Messages/${alert.provider_sid}.json`, {
        redirect: "error", signal: AbortSignal.timeout(5000),
        headers: { Authorization: `Basic ${btoa(`${config.key}:${config.secret}`)}` },
      });
      if (!response.ok) continue;
      const message = await response.json();
      if (message.sid !== alert.provider_sid) continue;
      const { error: saveError } = await db.from("gym_admin_order_alerts").update({
        status: deliveryStatus(message.status), updated_at: new Date().toISOString(),
        last_error: message.error_code ? `Twilio ${message.error_code}` : null,
      }).eq("id", alert.id).eq("status", "accepted");
      if (saveError) throw saveError;
    } catch { /* Delivery receipt lookup can safely be retried by the next sync. */ }
  }
  const { data: orders, error: claimError } = await db.rpc("gym_admin_claim_order_alerts");
  if (claimError) throw new Error("Upozornenia sa nepodarilo prevziať.");
  for (const order of orders || []) {
    const result = await sendOrderAlert(config, settings.recipient, order, fetcher);
    const { error: saveError } = await db.from("gym_admin_order_alerts").update({
      ...result, updated_at: new Date().toISOString(),
    }).eq("id", order.id).eq("status", "sending");
    if (saveError) throw new Error("Výsledok SMS sa nepodarilo uložiť. Ďalšie odosielanie je pozastavené do kontroly.");
  }
}
