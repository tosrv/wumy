import { describe, expect, it } from "vitest";
import { newPasswordIssue } from "./password";

describe("newPasswordIssue", () => {
  it("requires at least 8 characters", () => {
    expect(newPasswordIssue("1234567", "1234567")).toBe("Kata sandi minimal 8 karakter.");
  });

  it("requires both fields to match", () => {
    expect(newPasswordIssue("rahasia123", "rahasia124")).toBe("Konfirmasi kata sandi tidak sama.");
  });

  it("accepts a valid matching password", () => {
    expect(newPasswordIssue("rahasia123", "rahasia123")).toBeNull();
  });
});
