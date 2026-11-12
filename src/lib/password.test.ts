import { describe, expect, it } from "vitest";
import { isStrongPassword, newPasswordIssue, unmetPasswordRules } from "./password";

describe("unmetPasswordRules", () => {
  it("lists every rule for an empty password", () => {
    expect(unmetPasswordRules("")).toEqual(["length", "lower", "upper", "digit", "symbol"]);
  });

  it("reports only the missing pieces", () => {
    expect(unmetPasswordRules("rahasia123")).toEqual(["upper", "symbol"]);
    expect(unmetPasswordRules("Ra1!")).toEqual(["length"]);
  });

  it("treats spaces and non-ASCII characters as symbols", () => {
    expect(isStrongPassword("Rahasia 123")).toBe(true);
    expect(isStrongPassword("Rahasia123é")).toBe(true);
  });
});

describe("newPasswordIssue", () => {
  it("rejects a weak password", () => {
    expect(newPasswordIssue("rahasia123", "rahasia123")).toMatch(/belum cukup kuat/);
    expect(newPasswordIssue("rahasia123", "rahasia123", "en")).toMatch(/not strong enough/);
  });

  it("requires both fields to match", () => {
    expect(newPasswordIssue("Rahasia123!", "Rahasia124!")).toBe(
      "Konfirmasi kata sandi tidak sama.",
    );
    expect(newPasswordIssue("Rahasia123!", "x", "en")).toBe(
      "Password confirmation does not match.",
    );
  });

  it("accepts a strong matching password", () => {
    expect(newPasswordIssue("Rahasia123!", "Rahasia123!")).toBeNull();
  });
});
