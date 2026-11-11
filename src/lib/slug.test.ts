import { describe, expect, it } from "vitest";
import { RESERVED_SLUGS, isReservedSlug, isValidSlug } from "./slug";

describe("reserved slugs", () => {
  it("rejects every app route name", () => {
    for (const s of [
      "dashboard",
      "create",
      "login",
      "editor",
      "demo",
      "api",
      "payment",
      "admin",
      "forgot-password",
      "reset-password",
    ]) {
      expect(isValidSlug(s)).toBe(false);
      expect(isReservedSlug(s)).toBe(true);
    }
  });

  it("matches reserved names case-insensitively", () => {
    expect(isReservedSlug("Dashboard")).toBe(true);
  });

  it("still accepts normal and look-alike slugs", () => {
    expect(isValidSlug("ayu-budi")).toBe(true);
    expect(isValidSlug("dashboard-ayu")).toBe(true);
    expect(isValidSlug("admins")).toBe(true);
  });

  it("covers the current top-level routes", () => {
    for (const s of [
      "about",
      "product",
      "contact",
      "faq",
      "privacy",
      "terms",
      "refund",
      "invite",
    ]) {
      expect(RESERVED_SLUGS.has(s)).toBe(true);
    }
  });
});
