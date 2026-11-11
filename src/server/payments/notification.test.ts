import { describe, expect, it, vi } from "vitest";
import { buildDigest, buildSignature } from "./doku-signature";
import { handleDokuNotification, type NotificationDeps } from "./notification";

const SECRET = "SK-test";
const CLIENT_ID = "BRN-0001";
const TARGET = "/api/webhooks/doku";
const INVOICE = "WUMY1A2B3C4DABC123";

function body(status = "SUCCESS", invoice: string | null = INVOICE) {
  return JSON.stringify({
    order: invoice === null ? { amount: 199000 } : { invoice_number: invoice, amount: 199000 },
    transaction: { status },
  });
}

function signed(raw: string, opts: { secret?: string; clientId?: string } = {}) {
  const clientId = opts.clientId ?? CLIENT_ID;
  const parts = {
    clientId,
    requestId: "req-1",
    timestamp: "2026-11-10T03:00:00Z",
    target: TARGET,
    digest: buildDigest(raw),
  };
  return {
    headers: new Headers({
      "Client-Id": clientId,
      "Request-Id": parts.requestId,
      "Request-Timestamp": parts.timestamp,
      Signature: buildSignature(parts, opts.secret ?? SECRET),
    }),
    rawBody: raw,
    target: TARGET,
  };
}

function makeDeps(over: Partial<NotificationDeps> = {}) {
  return {
    secret: SECRET,
    clientId: CLIENT_ID,
    findPaymentByInvoice: vi.fn(async () => ({
      id: "pay-1",
      status: "pending",
      amount_cents: 19_900_000,
    })),
    getOrderStatus: vi.fn(async () => ({ status: "SUCCESS", amount: 199000 })),
    markPaid: vi.fn(async () => {}),
    log: vi.fn(),
    ...over,
  } satisfies NotificationDeps;
}

describe("handleDokuNotification", () => {
  it("bad signature → 401, markPaid not called", async () => {
    const deps = makeDeps();
    const res = await handleDokuNotification(deps, signed(body(), { secret: "wrong" }));
    expect(res.status).toBe(401);
    expect(deps.markPaid).not.toHaveBeenCalled();
  });

  it("missing signature headers → 401", async () => {
    const deps = makeDeps();
    const res = await handleDokuNotification(deps, {
      headers: new Headers(),
      rawBody: body(),
      target: TARGET,
    });
    expect(res.status).toBe(401);
  });

  it("valid signature but foreign Client-Id → 401", async () => {
    const deps = makeDeps();
    const res = await handleDokuNotification(deps, signed(body(), { clientId: "BRN-OTHER" }));
    expect(res.status).toBe(401);
    expect(deps.findPaymentByInvoice).not.toHaveBeenCalled();
    expect(deps.markPaid).not.toHaveBeenCalled();
  });

  it("signed FAILED → 200, not called", async () => {
    const deps = makeDeps();
    const res = await handleDokuNotification(deps, signed(body("FAILED")));
    expect(res).toEqual({ status: 200, body: "ignored" });
    expect(deps.findPaymentByInvoice).not.toHaveBeenCalled();
    expect(deps.markPaid).not.toHaveBeenCalled();
  });

  it("missing invoice number → 200, logged", async () => {
    const deps = makeDeps();
    const res = await handleDokuNotification(deps, signed(body("SUCCESS", null)));
    expect(res.status).toBe(200);
    expect(deps.log).toHaveBeenCalled();
    expect(deps.markPaid).not.toHaveBeenCalled();
  });

  it("unknown invoice → 200, logged", async () => {
    const deps = makeDeps({ findPaymentByInvoice: vi.fn(async () => null) });
    const res = await handleDokuNotification(deps, signed(body()));
    expect(res.status).toBe(200);
    expect(deps.log).toHaveBeenCalled();
    expect(deps.markPaid).not.toHaveBeenCalled();
  });

  it("duplicate paid no-op", async () => {
    const deps = makeDeps({
      findPaymentByInvoice: vi.fn(async () => ({
        id: "pay-1",
        status: "paid",
        amount_cents: 19_900_000,
      })),
    });
    const res = await handleDokuNotification(deps, signed(body()));
    expect(res.status).toBe(200);
    expect(deps.getOrderStatus).not.toHaveBeenCalled();
    expect(deps.markPaid).not.toHaveBeenCalled();
  });

  it("status lookup returns non-SUCCESS → 200, not called", async () => {
    const deps = makeDeps({
      getOrderStatus: vi.fn(async () => ({ status: "PENDING", amount: 199000 })),
    });
    const res = await handleDokuNotification(deps, signed(body()));
    expect(res.status).toBe(200);
    expect(deps.getOrderStatus).toHaveBeenCalledWith(INVOICE);
    expect(deps.log).toHaveBeenCalled();
    expect(deps.markPaid).not.toHaveBeenCalled();
  });

  it("amount mismatch → 200, not called", async () => {
    const deps = makeDeps({
      getOrderStatus: vi.fn(async () => ({ status: "SUCCESS", amount: 1000 })),
    });
    const res = await handleDokuNotification(deps, signed(body()));
    expect(res.status).toBe(200);
    expect(deps.log).toHaveBeenCalled();
    expect(deps.markPaid).not.toHaveBeenCalled();
  });

  it("status lookup error", async () => {
    const deps = makeDeps({
      getOrderStatus: vi.fn(async () => {
        throw new Error("boom");
      }),
    });
    const res = await handleDokuNotification(deps, signed(body()));
    expect(res.status).toBe(200);
    expect(deps.markPaid).not.toHaveBeenCalled();
    expect(deps.log).toHaveBeenCalled();
  });

  it("markPaid error → 200, logged", async () => {
    const deps = makeDeps({
      markPaid: vi.fn(async () => {
        throw new Error("db down");
      }),
    });
    const res = await handleDokuNotification(deps, signed(body()));
    expect(res.status).toBe(200);
    expect(deps.log).toHaveBeenCalled();
  });

  it("happy path → markPaid(id) exactly once, 200", async () => {
    const deps = makeDeps();
    const res = await handleDokuNotification(deps, signed(body()));
    expect(res.status).toBe(200);
    expect(deps.findPaymentByInvoice).toHaveBeenCalledWith(INVOICE);
    expect(deps.markPaid).toHaveBeenCalledTimes(1);
    expect(deps.markPaid).toHaveBeenCalledWith("pay-1");
    expect(deps.log).not.toHaveBeenCalled();
  });

  it("non-JSON body with valid signature → 200", async () => {
    const deps = makeDeps();
    const res = await handleDokuNotification(deps, signed("not json{"));
    expect(res.status).toBe(200);
    expect(deps.markPaid).not.toHaveBeenCalled();
  });
});
