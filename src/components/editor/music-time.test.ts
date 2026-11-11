import { describe, expect, it } from "vitest";
import { clampStart, formatMmSs, parseMmSs } from "./music-time";

describe("formatMmSs", () => {
  it("formats seconds as m:ss", () => {
    expect(formatMmSs(65)).toBe("1:05");
    expect(formatMmSs(0)).toBe("0:00");
  });
});

describe("parseMmSs", () => {
  it("accepts m:ss and plain seconds", () => {
    expect(parseMmSs("1:05")).toBe(65);
    expect(parseMmSs("65")).toBe(65);
    expect(parseMmSs(" 2:00 ")).toBe(120);
  });
  it("rejects negatives, bad seconds and garbage", () => {
    expect(parseMmSs("-1")).toBeNull();
    expect(parseMmSs("1:75")).toBeNull();
    expect(parseMmSs("abc")).toBeNull();
  });
});

describe("clampStart", () => {
  it("clamps to floor(duration) - 1, min 0", () => {
    expect(clampStart(90, 60)).toBe(59);
    expect(clampStart(10, 60)).toBe(10);
    expect(clampStart(5, 0.5)).toBe(0);
  });
});
