import { describe, expect, it } from "vitest";
import { prefersReducedMotion, shouldLockScroll } from "./motion";

describe("shouldLockScroll", () => {
  it("locks while closed and unlocks when open", () => {
    expect(shouldLockScroll(false)).toBe(true);
    expect(shouldLockScroll(true)).toBe(false);
  });
});

describe("prefersReducedMotion", () => {
  it("returns false without a window (SSR)", () => {
    expect(prefersReducedMotion()).toBe(false);
  });
});
