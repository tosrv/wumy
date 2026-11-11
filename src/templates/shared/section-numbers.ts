/**
 * Consecutive 1..n numbers for the sections that actually render, in the
 * given order. Hidden sections are absent from the result.
 */
export function numberSections<K extends string>(
  sections: readonly (readonly [K, boolean])[],
): Partial<Record<K, number>> {
  const out: Partial<Record<K, number>> = {};
  let n = 0;
  for (const [key, shown] of sections) if (shown) out[key] = ++n;
  return out;
}
