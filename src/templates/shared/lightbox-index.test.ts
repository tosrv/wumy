import { describe, expect, test } from "vitest";
import { nextFocusIndex, nextIndex, swipeDirection } from "./lightbox-index";

describe("nextIndex", () => {
  test("wraps forward and back", () => {
    expect(nextIndex(5, 6, 1)).toBe(0);
    expect(nextIndex(0, 6, -1)).toBe(5);
    expect(nextIndex(2, 6, 1)).toBe(3);
  });
  test("single photo", () => {
    expect(nextIndex(0, 1, 1)).toBe(0);
    expect(nextIndex(0, 1, -1)).toBe(0);
  });
});

describe("swipeDirection", () => {
  test("threshold 40px", () => {
    expect(swipeDirection(-39)).toBe(0);
    expect(swipeDirection(39)).toBe(0);
    expect(swipeDirection(-41)).toBe(1);
    expect(swipeDirection(41)).toBe(-1);
  });
});

describe("nextFocusIndex", () => {
  test("cycles forward and wraps", () => {
    expect(nextFocusIndex(0, 3, false)).toBe(1);
    expect(nextFocusIndex(2, 3, false)).toBe(0);
  });
  test("cycles backward and wraps", () => {
    expect(nextFocusIndex(0, 3, true)).toBe(2);
    expect(nextFocusIndex(1, 3, true)).toBe(0);
  });
  test("enters from outside and handles empty", () => {
    expect(nextFocusIndex(-1, 3, false)).toBe(0);
    expect(nextFocusIndex(-1, 3, true)).toBe(2);
    expect(nextFocusIndex(0, 0, false)).toBe(-1);
  });
});
