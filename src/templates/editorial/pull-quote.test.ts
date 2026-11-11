import { describe, expect, test } from "vitest";
import { pullQuote } from "./pull-quote";

describe("pullQuote", () => {
  test("empty or blank → null", () => {
    expect(pullQuote("")).toBeNull();
    expect(pullQuote("   ")).toBeNull();
  });

  test("short quote unchanged", () => {
    expect(pullQuote("Cinta itu sabar.")).toBe("Cinta itu sabar.");
    expect(pullQuote("  Cinta itu sabar.  ")).toBe("Cinta itu sabar.");
  });

  test("long quote cut at a word boundary with an ellipsis", () => {
    const words =
      "Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan pasangan untukmu, agar kamu merasa tenteram kepadanya sungguh.";
    const quote = words.padEnd(120, " x").slice(0, 120);
    expect(quote).toHaveLength(120);
    const out = pullQuote(quote)!;
    expect(out.length).toBeLessThanOrEqual(91);
    expect(out.endsWith("…")).toBe(true);
    const body = out.slice(0, -1);
    expect(quote.startsWith(body)).toBe(true);
    expect(quote[body.length] === " " || /[,.;:!?]/.test(quote[body.length]!)).toBe(true);
    expect(body).not.toMatch(/[\s,.;:!?]$/);
  });
});

describe("pullQuote edge cases", () => {
  test("strips trailing punctuation when the cut lands after a comma", () => {
    const quote = `${"a".repeat(85)}, ${"b".repeat(30)}`;
    const out = pullQuote(quote)!;
    expect(out.endsWith("…")).toBe(true);
    expect(out.at(-2)).not.toBe(",");
  });

  test("hard-cuts a single long word with no spaces", () => {
    const out = pullQuote("x".repeat(130))!;
    expect(out.length).toBeLessThanOrEqual(91);
    expect(out.endsWith("…")).toBe(true);
  });
});
