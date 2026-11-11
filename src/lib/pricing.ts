/**
 * Default one-time publish fee in rupiah. Shared by the server (what DOKU charges)
 * and the UI; the server may override it with PUBLISH_PRICE_IDR.
 */
export const DEFAULT_PUBLISH_PRICE_IDR = 99_000;

export function formatIdr(amount: number): string {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }
}
