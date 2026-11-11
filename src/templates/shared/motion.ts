/** True when the user asked the OS for reduced motion. Safe during SSR. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Page scroll stays locked while the invitation gate is closed. */
export function shouldLockScroll(open: boolean): boolean {
  return !open;
}
