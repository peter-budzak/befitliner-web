import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { createHmac } from "node:crypto";
import {
  normalizeOrder,
  verifySignature,
  PAYMENT_LINK,
  PRODUCT,
} from "../supabase/functions/admin-gym-orders/normalize.mjs";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const exports = {};
vm.runInNewContext(
  ts.transpileModule(readFileSync("lib/admin/metrics.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  { exports, Intl, Date, Set },
);
const rows = [
  {
    gym_id: "a",
    month: "2026-09-01",
    currency: "EUR",
    gross_minor: 15000,
    fee_minor: 1500,
    refunds_minor: 3000,
    fee_refunds_minor: 300,
    payment_count: 2,
    unknown_fee_count: 0,
  },
  {
    gym_id: "a",
    month: "2026-08-01",
    currency: "EUR",
    gross_minor: 5000,
    fee_minor: 0,
    refunds_minor: 0,
    fee_refunds_minor: 0,
    payment_count: 1,
    unknown_fee_count: 1,
  },
  {
    gym_id: "b",
    month: "2026-09-01",
    currency: "USD",
    gross_minor: 90000,
    fee_minor: 9000,
    refunds_minor: 0,
    fee_refunds_minor: 0,
    payment_count: 8,
    unknown_fee_count: 0,
  },
];
assert.equal(exports.totals(rows, "EUR", "2026-09").gross, 15000);
assert.equal(exports.totals(rows, "EUR").gross, 20000);
assert.equal(exports.totals(rows, "EUR").unknown, 1);
assert.equal(exports.totals(rows, "USD").gross, 90000);
assert.equal(exports.totals(rows, "EUR", undefined, "b").gross, 0);
assert.match(
  exports.csv([['=HYPERLINK("evil")', "+cmd", "-cmd", "@cmd", "normal;value"]]),
  /"'=HYPERLINK/,
);
assert.equal(
  exports.needsShipping({
    payment_status: "unpaid",
    fulfillment_status: "new",
  }),
  false,
);
assert.equal(
  exports.needsShipping({ payment_status: "paid", fulfillment_status: "new" }),
  true,
);
assert.equal(
  exports.needsShipping({
    payment_status: "refunded",
    fulfillment_status: "preparing",
  }),
  false,
);
const session = {
  id: "cs_live_test",
  payment_link: PAYMENT_LINK,
  livemode: true,
  amount_total: 1500,
  currency: "eur",
  created: 1789552800,
  payment_status: "unpaid",
  status: "open",
};
const items = {
  data: [{ quantity: 2, price: { product: PRODUCT } }],
  has_more: false,
};
const time = new Date().toISOString();
assert.equal(
  normalizeOrder(session, items, null, time).payment_status,
  "unpaid",
);
assert.equal(
  normalizeOrder({ ...session, status: "complete" }, items, null, time)
    .payment_status,
  "processing",
  "Browser completion cannot prove payment",
);
assert.equal(
  normalizeOrder({ ...session, payment_status: "paid" }, items, null, time)
    .payment_status,
  "unpaid",
  "Paid state requires a paid charge",
);
const charge = { paid: true, created: 1789552800, amount_refunded: 0 };
const paid = { ...session, payment_status: "paid", status: "complete" };
assert.equal(normalizeOrder(paid, items, charge, time).quantity, 2);
assert.equal(normalizeOrder(paid, items, charge, time).payment_status, "paid");
assert.equal(
  normalizeOrder(paid, items, { ...charge, amount_refunded: 500 }, time)
    .payment_status,
  "partially_refunded",
);
assert.equal(
  normalizeOrder(paid, items, { ...charge, amount_refunded: 1500 }, time)
    .payment_status,
  "refunded",
);
assert.equal(
  normalizeOrder(paid, items, { ...charge, disputed: true }, time)
    .payment_status,
  "disputed",
);
assert.throws(() =>
  normalizeOrder({ ...paid, livemode: false }, items, charge, time),
);
assert.throws(() =>
  normalizeOrder({ ...paid, payment_link: "other" }, items, charge, time),
);
assert.throws(() =>
  normalizeOrder(
    paid,
    { data: [{ quantity: 1, price: { product: "health" } }] },
    charge,
    time,
  ),
);
assert.throws(() =>
  normalizeOrder(paid, { ...items, has_more: true }, charge, time),
);
const timestamp = Math.floor(Date.now() / 1000);
const secret = "test-only-secret";
const body = JSON.stringify({ type: "checkout.session.completed" });
const signature = createHmac("sha256", secret)
  .update(`${timestamp}.${body}`)
  .digest("hex");
assert.equal(
  await verifySignature(body, `t=${timestamp},v1=${signature}`, secret),
  true,
);
assert.equal(
  await verifySignature(body + "x", `t=${timestamp},v1=${signature}`, secret),
  false,
);
assert.equal(
  await verifySignature(
    body,
    `t=${timestamp},v1=${signature}`,
    secret,
    (timestamp + 301) * 1000,
  ),
  false,
);
assert.equal(
  await verifySignature(body, `t=NaN,v1=${signature}`, secret),
  false,
);
console.log(
  "PASS: currency/month isolation, legacy fee coverage, safe CSV export, shipping eligibility, verified Stripe payment states, partial/full refunds, live account product scope, signature verification and replay window.",
);
