import type { PhotoRole } from "@/lib/invitation-content";

type PhotoLike = { role: string };

/** Whether adding `adding` photos of `role` would exceed the cap. Only gallery photos count. */
export function exceedsPhotoCap(
  existing: readonly PhotoLike[],
  role: PhotoRole,
  adding: number,
  max: number,
): boolean {
  if (role !== "gallery") return false;
  return existing.filter((p) => p.role === "gallery").length + adding > max;
}
