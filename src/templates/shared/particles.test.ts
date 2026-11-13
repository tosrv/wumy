import { describe, expect, it } from "vitest";
import { particleCount, spawnParticle, stepParticle } from "./particles";

/** Deterministic random numbers in [0, 1). */
function seeded(seed = 42): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const W = 390;
const H = 780;

describe("particleCount", () => {
  it("uses 40 particles on the cover and 18 after opening", () => {
    expect(particleCount("gold-dust", "cover", false)).toBe(40);
    expect(particleCount("gold-dust", "ambient", false)).toBe(18);
  });

  it("draws nothing under reduced motion", () => {
    expect(particleCount("gold-dust", "cover", true)).toBe(0);
    expect(particleCount("gold-dust", "ambient", true)).toBe(0);
  });
});

describe("spawnParticle", () => {
  it("places initial particles inside the box", () => {
    const rand = seeded();
    for (let i = 0; i < 1000; i++) {
      const p = spawnParticle("gold-dust", W, H, rand, true);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(W);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(H);
    }
  });

  it("respawns gold dust just below the bottom edge", () => {
    expect(spawnParticle("gold-dust", W, H, seeded(), false).y).toBe(H + 10);
  });

  it("keeps gold dust rising slowly with a small radius", () => {
    const rand = seeded(7);
    for (let i = 0; i < 1000; i++) {
      const p = spawnParticle("gold-dust", W, H, rand, i % 2 === 0);
      expect(p.vy).toBeGreaterThanOrEqual(-0.33);
      expect(p.vy).toBeLessThanOrEqual(-0.08);
      expect(p.r).toBeGreaterThanOrEqual(0.4);
      expect(p.r).toBeLessThanOrEqual(2);
    }
  });
});

describe("stepParticle", () => {
  it("moves a particle up by its vertical speed", () => {
    const p = { x: 100, y: 300, r: 1, vx: 0, vy: -0.2, phase: 0 };
    const next = stepParticle(p, W, H, seeded(), "gold-dust");
    expect(next.y).toBeCloseTo(299.8);
    expect(next.phase).toBeCloseTo(0.02);
  });

  it("recycles a particle that left the top edge", () => {
    const p = { x: 100, y: -10.9, r: 1, vx: 0, vy: -0.2, phase: 0 };
    expect(stepParticle(p, W, H, seeded(), "gold-dust").y).toBe(H + 10);
  });
});
