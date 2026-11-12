import { describe, expect, it } from "vitest";
import { isCaptchaError } from "./turnstile";

describe("isCaptchaError", () => {
  it("detects Supabase captcha errors", () => {
    expect(isCaptchaError("captcha protection: request disallowed (no captcha response)")).toBe(
      true,
    );
    expect(isCaptchaError("Captcha verification process failed")).toBe(true);
  });

  it("ignores other errors and empty values", () => {
    expect(isCaptchaError("Invalid login credentials")).toBe(false);
    expect(isCaptchaError(null)).toBe(false);
    expect(isCaptchaError(undefined)).toBe(false);
  });
});
