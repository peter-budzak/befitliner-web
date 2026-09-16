import type { Finance, ModuleOrder } from "./types";
export const PAYMENT_LABELS: Record<string, string> = {
  paid: "Zaplatené",
  unpaid: "Nezaplatené",
  processing: "Spracúva sa",
  expired: "Nedokončené",
  partially_refunded: "Čiastočne vrátené",
  refunded: "Vrátené",
  disputed: "Spor o platbu",
};
export const SHIPPING_LABELS: Record<string, string> = {
  new: "Nová objednávka",
  preparing: "Pripravuje sa",
  shipped: "Odoslané",
  delivered: "Doručené",
  on_hold: "Pozastavené",
  canceled: "Zrušené",
};
export function money(minor: number, currency = "EUR") {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}
export function date(value: string | null, time = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("sk-SK", {
    dateStyle: "medium",
    ...(time ? { timeStyle: "short" as const } : {}),
    timeZone: "Europe/Bratislava",
  }).format(new Date(value));
}
export function currentMonth() {
  const parts = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Europe/Bratislava",
  }).formatToParts(new Date());
  return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}`;
}
export function totals(
  rows: Finance[],
  currency: string,
  month?: string,
  gymId?: string,
) {
  return rows
    .filter(
      (r) =>
        r.currency === currency &&
        (!month || r.month.startsWith(month)) &&
        (!gymId || r.gym_id === gymId),
    )
    .reduce(
      (a, r) => ({
        gross: a.gross + r.gross_minor,
        fees: a.fees + r.fee_minor,
        refunds: a.refunds + r.refunds_minor,
        feeRefunds: a.feeRefunds + r.fee_refunds_minor,
        payments: a.payments + r.payment_count,
        unknown: a.unknown + r.unknown_fee_count,
      }),
      { gross: 0, fees: 0, refunds: 0, feeRefunds: 0, payments: 0, unknown: 0 },
    );
}
export function needsShipping(order: ModuleOrder) {
  return (
    ["paid", "partially_refunded"].includes(order.payment_status) &&
    ["new", "preparing"].includes(order.fulfillment_status)
  );
}
export function csv(rows: (string | number | null)[][]) {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let cell = String(value ?? "");
            if (/^[\s]*[=+\-@\t\r]/.test(cell)) cell = "'" + cell;
            return '"' + cell.replace(/"/g, '""') + '"';
          })
          .join(";"),
      )
      .join("\r\n")
  );
}
export function downloadCsv(name: string, rows: (string | number | null)[][]) {
  const url = URL.createObjectURL(
    new Blob([csv(rows)], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
