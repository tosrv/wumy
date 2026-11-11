/** 65 -> "1:05" */
export function formatMmSs(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Accepts "m:ss" or plain seconds; returns whole seconds, or null when invalid. */
export function parseMmSs(text: string): number | null {
  const value = text.trim();
  const plain = /^(\d+)$/.exec(value);
  if (plain) return Number(plain[1]);
  const mmss = /^(\d+):(\d{1,2})$/.exec(value);
  if (!mmss) return null;
  const seconds = Number(mmss[2]);
  if (seconds > 59) return null;
  return Number(mmss[1]) * 60 + seconds;
}

/** Keeps the start inside the track: at most floor(duration) - 1, at least 0. */
export function clampStart(start: number, duration: number): number {
  const max = Math.max(0, Math.floor(duration) - 1);
  return Math.min(Math.max(0, Math.floor(start)), max);
}
