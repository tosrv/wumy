import { describe, expect, test } from "vitest";
import { countdownParts } from "./countdown";

describe("countdownParts", () => {
  test("splits remaining time", () => {
    const now = 1_000_000;
    const target = now + (86400 + 3600 + 60 + 1) * 1000;
    expect(countdownParts(target, now)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
      done: false,
    });
  });
  test("past is done", () => {
    expect(countdownParts(0, 5000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      done: true,
    });
  });
  test("exactly now is done", () => {
    expect(countdownParts(5000, 5000).done).toBe(true);
  });
});
