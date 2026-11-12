import { describe, expect, it } from "vitest";
import { isStrongPassword } from "@/lib/password";
import { generateStrongPassword } from "./admin";

describe("generateStrongPassword", () => {
  it("always meets the strong-password rules", () => {
    for (let i = 0; i < 200; i++) {
      const pw = generateStrongPassword();
      expect(pw).toHaveLength(16);
      expect(isStrongPassword(pw)).toBe(true);
    }
  });

  it("is random", () => {
    expect(generateStrongPassword()).not.toBe(generateStrongPassword());
  });
});
