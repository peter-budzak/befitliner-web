import assert from "node:assert/strict";
import { orderAlertText, twilioConfig, sendOrderAlert, deliveryStatus } from "../supabase/functions/admin-gym-orders/alerts.mjs";

const order = { order_id: "00000000-0000-4000-8000-000000000001", quantity: 1, amount_minor: 1500, currency: "EUR", attempts: 1 };
const config = { account: "AC" + "a".repeat(32), key: "SK" + "b".repeat(32), secret: "test-only", sender: "Fitliner" };
const recipient = "+421900000000";
const sid = "SM" + "c".repeat(32);
const text = orderAlertText(order);
assert.match(text, /15\.00 EUR/);
assert.match(text, /https:\/\/admin\.befitliner\.com/);
assert.ok(text.length <= 160 && /^[\x20-\x7e]+$/.test(text), "Single ASCII SMS segment");
assert.throws(() => orderAlertText({ ...order, currency: "USD" }));
assert.throws(() => orderAlertText({ ...order, amount_minor: 1000 }));
assert.throws(() => orderAlertText({ ...order, order_id: "Injected contact details" }));
assert.equal(twilioConfig(() => undefined), null);
const secrets = { GYM_ADMIN_TWILIO_ACCOUNT_SID: config.account, GYM_ADMIN_TWILIO_API_KEY: config.key, GYM_ADMIN_TWILIO_API_SECRET: config.secret };
assert.deepEqual(twilioConfig(name => secrets[name]), config);
const sent = await sendOrderAlert(config, recipient, order, async (url, request) => {
  assert.equal(url, `https://api.twilio.com/2010-04-01/Accounts/${config.account}/Messages.json`);
  assert.equal(request.method, "POST");
  assert.equal(request.redirect, "error");
  assert.equal(request.body.get("To"), recipient);
  assert.equal(request.body.get("Body"), text);
  return new Response(JSON.stringify({ sid, status: "queued" }), { status: 201 });
});
assert.equal(sent.status, "accepted", "Provider acceptance is not confirmed delivery");
assert.equal(sent.provider_sid, sid);
for (const status of [400, 401, 403]) {
  const result = await sendOrderAlert(config, recipient, order, async () => new Response(JSON.stringify({ code: 20003, message: "private provider response" }), { status }));
  assert.equal(result.status, "failed");
  assert.ok(!result.last_error.includes("private"));
}
assert.equal((await sendOrderAlert(config, recipient, order, async () => { throw new Error("Timeout with credentials"); })).status, "unknown");
assert.equal((await sendOrderAlert(config, recipient, order, async () => new Response("{}", { status: 500 }))).status, "unknown");
assert.equal((await sendOrderAlert(config, recipient, order, async () => new Response("{}", { status: 429 }))).status, "pending");
assert.equal((await sendOrderAlert(config, recipient, { ...order, attempts: 5 }, async () => new Response("{}", { status: 429 }))).status, "failed");
assert.equal((await sendOrderAlert(config, recipient, order, async () => new Response("{}", { status: 201 }))).status, "unknown");
assert.equal(deliveryStatus("sent"), "accepted");
assert.equal(deliveryStatus("delivered"), "delivered");
assert.equal(deliveryStatus("undelivered"), "failed");
console.log("PASS: 15 EUR order scope, private single-segment SMS, disabled missing credentials, provider acceptance/delivery separation, redacted errors, bounded rate-limit retry and no blind retry after uncertain delivery.");
