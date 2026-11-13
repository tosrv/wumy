import { describe, expect, it } from "vitest";
import { staggerDelayMs } from "./stagger";

describe("staggerDelayMs", () => {
  it("starts at zero and steps by 120 ms", () => {
    expect(staggerDelayMs(0)).toBe(0);
    expect(staggerDelayMs(3)).toBe(360);
  });

  it("caps long lists at 900 ms", () => {
    expect(staggerDelayMs(50)).toBe(900);
  });

  it("accepts a base, step, and cap", () => {
    expect(staggerDelayMs(2, { baseMs: 1000, stepMs: 200, maxMs: 2000 })).toBe(1400);
  });

  it("treats negative or invalid indexes as the first item", () => {
    expect(staggerDelayMs(-1)).toBe(0);
    expect(staggerDelayMs(Number.NaN)).toBe(0);
  });
});
