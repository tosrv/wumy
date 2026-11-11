import { describe, expect, it, vi } from "vitest";
import { createCheckout, DokuError, getOrderStatus } from "./doku-client";
import { buildDigest, buildSignature, dokuTimestamp } from "./doku-signature";
import type { PaymentConfig } from "./config";

const cfg: PaymentConfig = {
  dokuClientId: "MCH-0001",
  dokuSecretKey: "SK-test",
  dokuApiBase: "https://api-sandbox.doku.com",
  supabaseUrl: "https://x.supabase.co",
  serviceRoleKey: "srk",
  siteUrl: "https://wumy.test",
  priceIdr: 199000,
};
const NOW = new Date("2024-07-12T09:47:11.456Z");
const UUID = "11111111-2222-3333-4444-555555555555";
const input = {
  invoiceNumber: "WUMYABCD1234XYZ",
  amount: 199000,
  customerName: "Budi",
  customerEmail: "budi@example.com",
  callbackUrl: "https://wumy.test/payment/status?invoice=WUMYABCD1234XYZ",
  dueMinutes: 60,
};

function fakeFetch(status: number, body: unknown) {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
}
const deps = (f: ReturnType<typeof fakeFetch>) => ({
  fetch: f as unknown as typeof fetch,
  now: () => NOW,
  uuid: () => UUID,
});

const okCheckout = {
  message: ["SUCCESS"],
  response: {
    payment: {
      token_id: "tok123",
      url: "https://sandbox.doku.com/checkout-link-v2/tok123",
      expired_date: "20240712104711",
    },
  },
};

describe("createCheckout", () => {
  it("sends a signed POST and parses the response", async () => {
    const f = fakeFetch(200, okCheckout);
    const result = await createCheckout(cfg, input, deps(f));

    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api-sandbox.doku.com/checkout/v1/payment");
    expect(init.method).toBe("POST");

    const body = init.body as string;
    const headers = init.headers as Record<string, string>;
    expect(headers["Client-Id"]).toBe("MCH-0001");
    expect(headers["Request-Id"]).toBe(UUID);
    expect(headers["Request-Timestamp"]).toBe(dokuTimestamp(NOW));
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["Signature"]).toBe(
      buildSignature(
        {
          clientId: "MCH-0001",
          requestId: UUID,
          timestamp: dokuTimestamp(NOW),
          target: "/checkout/v1/payment",
          digest: buildDigest(body),
        },
        "SK-test",
      ),
    );

    const parsed = JSON.parse(body);
    expect(parsed.order.amount).toBe(199000);
    expect(parsed.order.invoice_number).toBe("WUMYABCD1234XYZ");
    expect(parsed.order.callback_url).toBe(input.callbackUrl);
    expect(parsed.order.callback_url_result).toBe(input.callbackUrl);
    expect(parsed.order.auto_redirect).toBe(true);
    expect(parsed.payment.payment_due_date).toBe(60);
    expect(parsed.customer.name).toBe("Budi");
    expect(parsed.customer.email).toBe("budi@example.com");

    expect(result.url).toBe("https://sandbox.doku.com/checkout-link-v2/tok123");
    expect(result.tokenId).toBe("tok123");
    expect(result.expiresAt.toISOString()).toBe("2024-07-12T03:47:11.000Z");
  });

  it("throws DokuError with status and DOKU message on non-2xx", async () => {
    const f = fakeFetch(400, { error: { message: "Invalid amount" } });
    const err = await createCheckout(cfg, input, deps(f)).catch((e) => e);
    expect(err).toBeInstanceOf(DokuError);
    expect(err.status).toBe(400);
    expect(err.message).toContain("Invalid amount");
  });

  it("uses a top-level message array/string when present", async () => {
    const f = fakeFetch(401, { message: ["Invalid Signature"] });
    const err = await createCheckout(cfg, input, deps(f)).catch((e) => e);
    expect(err).toBeInstanceOf(DokuError);
    expect(err.status).toBe(401);
    expect(err.message).toContain("Invalid Signature");
  });

  it("falls back to status text when the body is not JSON", async () => {
    const f = vi.fn(async () => new Response("oops", { status: 502, statusText: "Bad Gateway" }));
    const err = await createCheckout(cfg, input, deps(f as never)).catch((e) => e);
    expect(err).toBeInstanceOf(DokuError);
    expect(err.status).toBe(502);
    expect(err.message).toContain("Bad Gateway");
  });

  it("propagates network errors unchanged", async () => {
    const boom = new Error("network down");
    const f = vi.fn(async () => {
      throw boom;
    });
    await expect(createCheckout(cfg, input, deps(f as never))).rejects.toBe(boom);
  });
});

describe("getOrderStatus", () => {
  it("signs a GET without digest and parses status and amount", async () => {
    const f = fakeFetch(200, {
      transaction: { status: "SUCCESS" },
      order: { invoice_number: "INV1", amount: 199000 },
    });
    const result = await getOrderStatus(cfg, "INV1", deps(f));

    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api-sandbox.doku.com/orders/v1/status/INV1");
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
    const headers = init.headers as Record<string, string>;
    expect(headers["Signature"]).toBe(
      buildSignature(
        {
          clientId: "MCH-0001",
          requestId: UUID,
          timestamp: dokuTimestamp(NOW),
          target: "/orders/v1/status/INV1",
        },
        "SK-test",
      ),
    );
    expect(result).toEqual({ status: "SUCCESS", amount: 199000 });
  });

  it.each(["199000", "199000.00"])("accepts string amount %s", async (amount) => {
    const f = fakeFetch(200, { transaction: { status: "SUCCESS" }, order: { amount } });
    expect(await getOrderStatus(cfg, "INV1", deps(f))).toEqual({
      status: "SUCCESS",
      amount: 199000,
    });
  });

  it("throws DokuError on a non-numeric amount", async () => {
    const f = fakeFetch(200, { transaction: { status: "SUCCESS" }, order: { amount: "abc" } });
    await expect(getOrderStatus(cfg, "INV1", deps(f))).rejects.toBeInstanceOf(DokuError);
  });

  it("throws DokuError on non-2xx", async () => {
    const f = fakeFetch(404, { error: "not found" });
    const err = await getOrderStatus(cfg, "INV1", deps(f)).catch((e) => e);
    expect(err).toBeInstanceOf(DokuError);
    expect(err.status).toBe(404);
    expect(err.message).toContain("not found");
  });
});
