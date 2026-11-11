import { expect, test } from "vitest";
import { numberSections } from "./section-numbers";

test("numbers only shown sections, consecutively", () => {
  expect(
    numberSections([
      ["a", true],
      ["b", false],
      ["c", true],
      ["d", true],
    ] as const),
  ).toEqual({ a: 1, c: 2, d: 3 });
});
