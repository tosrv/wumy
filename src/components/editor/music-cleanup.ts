/** Pending music files that the just-written content no longer references. */
export function pathsSafeToDelete(pending: string[], savedPath: string | undefined): string[] {
  return pending.filter((p) => p !== savedPath);
}

/** Uploaded tracks are named `music-<ms>.mp3` (see uploadMusicWith). */
const MUSIC_FILE_RE = /\/music-\d+\.mp3$/;

/**
 * Music files left in an invitation's storage folder that no content refers to —
 * e.g. a replaced track whose save never happened because the tab was closed.
 * `keep` lists every path that may still be referenced (saved row, last written,
 * current form value); those are never returned.
 */
export function orphanedMusicPaths(listed: string[], keep: (string | undefined)[]): string[] {
  const keepSet = new Set(keep.filter((p): p is string => Boolean(p)));
  return listed.filter((p) => MUSIC_FILE_RE.test(p) && !keepSet.has(p));
}
