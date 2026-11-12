import { describe, expect, it } from "vitest";
import { isNewAccount, NEW_ACCOUNT_WINDOW_MS } from "./oauth-signup";

describe("isNewAccount", () => {
  const created = "2026-11-12T03:00:00.000Z";

  it("treats a first sign-in right after creation as a new account", () => {
    expect(isNewAccount({ created_at: created, last_sign_in_at: "2026-11-12T03:00:01.500Z" })).toBe(
      true,
    );
  });

  it("treats a later sign-in as a returning account", () => {
    const later = new Date(Date.parse(created) + NEW_ACCOUNT_WINDOW_MS + 1).toISOString();
    expect(isNewAccount({ created_at: created, last_sign_in_at: later })).toBe(false);
    expect(isNewAccount({ created_at: created, last_sign_in_at: "2026-11-20T10:00:00Z" })).toBe(
      false,
    );
  });

  it("returns false when timestamps are missing or invalid", () => {
    expect(isNewAccount({ created_at: created })).toBe(false);
    expect(isNewAccount({ created_at: null, last_sign_in_at: created })).toBe(false);
    expect(isNewAccount({ created_at: "nope", last_sign_in_at: created })).toBe(false);
  });
});
