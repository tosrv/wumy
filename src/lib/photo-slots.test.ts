import { describe, expect, it } from "vitest";
import { exceedsPhotoCap } from "./photo-slots";

const gallery = (n: number) => Array.from({ length: n }, () => ({ role: "gallery" }));

describe("exceedsPhotoCap", () => {
  it("caps gallery uploads", () => {
    expect(exceedsPhotoCap(gallery(6), "gallery", 1, 6)).toBe(true);
    expect(exceedsPhotoCap(gallery(5), "gallery", 1, 6)).toBe(false);
  });
  it("ignores non-gallery roles in the count and the check", () => {
    expect(exceedsPhotoCap(gallery(6), "partner_a", 1, 6)).toBe(false);
    expect(exceedsPhotoCap([...gallery(5), { role: "cover" }], "gallery", 1, 6)).toBe(false);
  });
});
