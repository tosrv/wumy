import { describe, expect, it, vi } from "vitest";
import { CheckoutError } from "./checkout";
import { DokuError } from "./doku-client";
import { toClientError } from "./error-message";

describe("toClientError", () => {
  it("prefixes CheckoutError messages with their code", () => {
    expect(
      toClientError(new CheckoutError("already_paid", "Invitation is already paid")).message,
    ).toBe("already_paid: Invitation is already paid");
  });
  it("wraps DokuError as a provider error", () => {
    expect(toClientError(new DokuError(502, "bad gateway")).message).toBe(
      "Payment provider error: bad gateway",
    );
  });
  it("hides unknown errors behind a generic message and logs the original", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(toClientError(new Error("db password leaked")).message).toBe("Unexpected error");
    expect(toClientError("x").message).toBe("Unexpected error");
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});
