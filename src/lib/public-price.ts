import { getPaymentConfig } from "@/server/payments/functions";
import { DEFAULT_PUBLISH_PRICE_IDR } from "@/lib/pricing";

/** Price as charged by the server (PUBLISH_PRICE_IDR or default), for route loaders. */
export async function loadPublishPriceIdr(): Promise<number> {
  try {
    return (await getPaymentConfig()).priceIdr;
  } catch {
    return DEFAULT_PUBLISH_PRICE_IDR;
  }
}
