/** Pure particle logic for `ParticleField` (decorative floating dust, petals, ...). */

export type Particle = {
  x: number;
  y: number;
  /** Radius in CSS pixels. */
  r: number;
  vx: number;
  /** Vertical speed per frame; negative rises. */
  vy: number;
  /** Drives the sideways wobble and the twinkle. */
  phase: number;
};

export type ParticleKind = "gold-dust";

export type ParticleDensity = "cover" | "ambient";

const COUNTS: Record<ParticleKind, Record<ParticleDensity, number>> = {
  "gold-dust": { cover: 40, ambient: 18 },
};

/** Spawn distance outside the edge a particle enters from. */
const EDGE = 10;

export function particleCount(
  kind: ParticleKind,
  density: ParticleDensity,
  reducedMotion: boolean,
): number {
  return reducedMotion ? 0 : COUNTS[kind][density];
}

export function spawnParticle(
  _kind: ParticleKind,
  width: number,
  height: number,
  rand: () => number,
  initial: boolean,
): Particle {
  return {
    x: rand() * width,
    y: initial ? rand() * height : height + EDGE,
    r: 0.4 + rand() * 1.6,
    vx: (rand() - 0.5) * 0.25,
    vy: -(0.08 + rand() * 0.25),
    phase: rand() * Math.PI * 2,
  };
}

export function stepParticle(
  p: Particle,
  width: number,
  height: number,
  rand: () => number,
  kind: ParticleKind,
): Particle {
  const next = {
    ...p,
    x: p.x + p.vx + Math.sin(p.phase) * 0.3,
    y: p.y + p.vy,
    phase: p.phase + 0.02,
  };
  return next.y < -EDGE ? spawnParticle(kind, width, height, rand, false) : next;
}
