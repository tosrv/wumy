import { describe, expect, it } from "vitest";
import { PUBLISH_AMOUNT_IDR, readPaymentConfig, readPublishPriceIdr } from "./config";

const FULL = {
  DOKU_CLIENT_ID: "MCH-1",
  DOKU_SECRET_KEY: "SK-1",
  DOKU_API_BASE: "https://api-sandbox.doku.com",
  VITE_SUPABASE_URL: "https://x.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role",
  VITE_SITE_URL: "https://wumy.id",
};

describe("readPaymentConfig", () => {
  it("maps env vars to config", () => {
    expect(readPaymentConfig(FULL)).toEqual({
      dokuClientId: "MCH-1",
      dokuSecretKey: "SK-1",
      dokuApiBase: "https://api-sandbox.doku.com",
      supabaseUrl: "https://x.supabase.co",
      serviceRoleKey: "service-role",
      siteUrl: "https://wumy.id",
      priceIdr: 99000,
    });
  });

  it.each(Object.keys(FULL))("returns null when %s is missing", (key) => {
    expect(readPaymentConfig({ ...FULL, [key]: undefined })).toBeNull();
  });

  it.each(Object.keys(FULL))("returns null when %s is blank", (key) => {
    expect(readPaymentConfig({ ...FULL, [key]: "   " })).toBeNull();
  });

  it("normalises site url", () => {
    expect(readPaymentConfig({ ...FULL, VITE_SITE_URL: "https://wumy.id/" })?.siteUrl).toBe(
      "https://wumy.id",
    );
  });

  it("trims values and strips trailing slash from the DOKU base", () => {
    const c = readPaymentConfig({
      ...FULL,
      DOKU_API_BASE: " https://api.doku.com/ ",
      DOKU_CLIENT_ID: " MCH-1 ",
    });
    expect(c?.dokuApiBase).toBe("https://api.doku.com");
    expect(c?.dokuClientId).toBe("MCH-1");
  });

  it("price is 199000 IDR", () => {
    expect(PUBLISH_AMOUNT_IDR).toBe(99000);
  });
});

describe("readPublishPriceIdr", () => {
  it("defaults to Rp 99.000 when unset or blank", () => {
    expect(readPublishPriceIdr({})).toBe(PUBLISH_AMOUNT_IDR);
    expect(readPublishPriceIdr({ PUBLISH_PRICE_IDR: "  " })).toBe(99000);
  });

  it("uses a whole-rupiah override", () => {
    expect(readPublishPriceIdr({ PUBLISH_PRICE_IDR: " 10000 " })).toBe(10000);
    expect(readPaymentConfig({ ...FULL, PUBLISH_PRICE_IDR: "10000" })?.priceIdr).toBe(10000);
  });

  it.each(["abc", "10.000", "10000.5", "-5000", "999", "0", "1e5"])(
    "falls back to the default for invalid value %s",
    (raw) => {
      expect(readPublishPriceIdr({ PUBLISH_PRICE_IDR: raw })).toBe(99000);
    },
  );
});
