export type PaymentStatusView = "waiting" | "paid" | "timeout" | "unknown";

export const PAYMENT_POLL_MS = 3_000;
export const PAYMENT_TIMEOUT_MS = 120_000;
export const PAYMENT_UNKNOWN_MS = 10_000;

export function paymentStatusView(
  row: { status: string } | null,
  elapsedMs: number,
  hasInvoice = true,
): PaymentStatusView {
  if (!hasInvoice) return "unknown";
  if (row?.status === "paid") return "paid";
  if (!row && elapsedMs >= PAYMENT_UNKNOWN_MS) return "unknown";
  if (elapsedMs < PAYMENT_TIMEOUT_MS) return "waiting";
  return "timeout";
}
