import { describe, expect, it } from "vitest";
import { getDisplayName, getProfileName } from "./display-name";

describe("getProfileName", () => {
  it("prefers the name set in Settings over the Google name", () => {
    expect(
      getProfileName({ user_metadata: { display_name: " Budi ", full_name: "Budi Santoso" } }),
    ).toBe("Budi");
  });

  it("falls back to full_name", () => {
    expect(getProfileName({ user_metadata: { full_name: "Budi Santoso" } })).toBe("Budi Santoso");
  });

  it("ignores blank or non-string values", () => {
    expect(getProfileName({ user_metadata: { display_name: "  ", full_name: 5 } })).toBe("");
    expect(getProfileName(null)).toBe("");
  });
});

describe("getDisplayName", () => {
  it("falls back to the email local part, then the fallback", () => {
    expect(getDisplayName({ email: "budi@example.com", user_metadata: {} }, "Account")).toBe(
      "budi",
    );
    expect(getDisplayName(undefined, "Account")).toBe("Account");
  });
});
