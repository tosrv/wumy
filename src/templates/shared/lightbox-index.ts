export const SWIPE_THRESHOLD_PX = 40;

/** Next index in a ring of `len` items. */
export function nextIndex(i: number, len: number, dir: 1 | -1): number {
  if (len <= 0) return 0;
  return (((i + dir) % len) + len) % len;
}

/** Horizontal drag distance to direction: swipe left (dx < 0) goes forward. */
export function swipeDirection(dx: number): 1 | -1 | 0 {
  if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return 0;
  return dx < 0 ? 1 : -1;
}

/** Focus-trap cycling: index of the next focusable after Tab (or Shift+Tab). -1 current = outside. */
export function nextFocusIndex(current: number, count: number, shift: boolean): number {
  if (count <= 0) return -1;
  if (current < 0) return shift ? count - 1 : 0;
  return (current + (shift ? -1 : 1) + count) % count;
}
