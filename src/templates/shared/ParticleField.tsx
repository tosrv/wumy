import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "./motion";
import {
  particleCount,
  spawnParticle,
  stepParticle,
  type Particle,
  type ParticleDensity,
  type ParticleKind,
} from "./particles";

const MAX_DPR = 2;

/**
 * Decorative floating particles on a canvas that fills its positioned parent.
 * Renders nothing under reduced motion; pauses off-screen and in hidden tabs.
 */
export function ParticleField({
  kind,
  density,
  color,
  className,
}: {
  kind: ParticleKind;
  density: ParticleDensity;
  /** CSS colour as `r g b`, e.g. `240 205 120`; alpha is animated. */
  color: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Decided after mount so SSR and the first client render match.
  useEffect(() => setEnabled(!prefersReducedMotion()), []);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!enabled || !canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let onScreen = true;
    let frame = 0;
    const rand = Math.random;

    const resize = () => {
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) {
        const n = particleCount(kind, density, false);
        particles = Array.from({ length: n }, () => spawnParticle(kind, width, height, rand, true));
      }
    };
    resize();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(canvas);
    const visibility =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            onScreen = entry?.isIntersecting ?? true;
          })
        : null;
    visibility?.observe(canvas);

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!onScreen || document.hidden) return;
      ctx.clearRect(0, 0, width, height);
      particles = particles.map((p) => {
        const next = stepParticle(p, width, height, rand, kind);
        ctx.fillStyle = `rgb(${color} / ${0.45 + Math.sin(next.phase * 2) * 0.35})`;
        ctx.beginPath();
        ctx.arc(next.x, next.y, next.r, 0, Math.PI * 2);
        ctx.fill();
        return next;
      });
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      visibility?.disconnect();
    };
  }, [enabled, kind, density, color]);

  if (!enabled) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
