/** Delay before the `index`-th item of a staggered reveal starts. */
export function staggerDelayMs(
  index: number,
  {
    baseMs = 0,
    stepMs = 120,
    maxMs = 900,
  }: { baseMs?: number; stepMs?: number; maxMs?: number } = {},
): number {
  const i = Number.isFinite(index) && index > 0 ? index : 0;
  return Math.min(baseMs + i * stepMs, maxMs);
}
