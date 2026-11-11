import { DEFAULT_PUBLISH_PRICE_IDR } from "@/lib/pricing";

/** Default publish fee in rupiah, used when PUBLISH_PRICE_IDR is unset or invalid. */
export const PUBLISH_AMOUNT_IDR = DEFAULT_PUBLISH_PRICE_IDR;
/** Lowest accepted override; DOKU rejects very small amounts on most channels. */
export const MIN_PUBLISH_PRICE_IDR = 1000;

/** Publish fee from `PUBLISH_PRICE_IDR` (whole rupiah, digits only, ≥ 1000), else the default. */
export function readPublishPriceIdr(env: Record<string, string | undefined>): number {
  const raw = env["PUBLISH_PRICE_IDR"]?.trim();
  if (!raw || !/^\d+$/.test(raw)) return PUBLISH_AMOUNT_IDR;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= MIN_PUBLISH_PRICE_IDR ? n : PUBLISH_AMOUNT_IDR;
}

export type PaymentConfig = {
  dokuClientId: string;
  dokuSecretKey: string;
  dokuApiBase: string;
  supabaseUrl: string;
  serviceRoleKey: string;
  siteUrl: string;
  priceIdr: number;
};

/** Server-only: holds secrets. Returns null when any value is missing or blank. */
export function readPaymentConfig(env: Record<string, string | undefined>): PaymentConfig | null {
  const get = (key: string) => env[key]?.trim() || undefined;
  const stripSlash = (v: string) => v.replace(/\/+$/, "");

  const dokuClientId = get("DOKU_CLIENT_ID");
  const dokuSecretKey = get("DOKU_SECRET_KEY");
  const dokuApiBase = get("DOKU_API_BASE");
  const supabaseUrl = get("VITE_SUPABASE_URL");
  const serviceRoleKey = get("SUPABASE_SERVICE_ROLE_KEY");
  const siteUrl = get("VITE_SITE_URL");

  if (
    !dokuClientId ||
    !dokuSecretKey ||
    !dokuApiBase ||
    !supabaseUrl ||
    !serviceRoleKey ||
    !siteUrl
  ) {
    return null;
  }
  return {
    dokuClientId,
    dokuSecretKey,
    dokuApiBase: stripSlash(dokuApiBase),
    supabaseUrl,
    serviceRoleKey,
    siteUrl: stripSlash(siteUrl),
    priceIdr: readPublishPriceIdr(env),
  };
}
