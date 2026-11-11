import { describe, expect, it } from "vitest";
import { paymentStatusView } from "./payment-status";

describe("paymentStatusView", () => {
  it("is paid when status is paid", () => {
    expect(paymentStatusView({ status: "paid" }, 500)).toBe("paid");
  });
  it("is waiting at 3 s", () => {
    expect(paymentStatusView({ status: "pending" }, 3_000)).toBe("waiting");
  });
  it("times out at 120 s", () => {
    expect(paymentStatusView({ status: "pending" }, 120_000)).toBe("timeout");
  });
  it("is unknown when row is null at 10 s", () => {
    expect(paymentStatusView(null, 10_000)).toBe("unknown");
  });
  it("is waiting when row is null early", () => {
    expect(paymentStatusView(null, 3_000)).toBe("waiting");
  });
  it("is unknown immediately without an invoice", () => {
    expect(paymentStatusView(null, 0, false)).toBe("unknown");
  });
});
