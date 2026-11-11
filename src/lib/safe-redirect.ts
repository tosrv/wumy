const BASE = "http://x.invalid";

/**
 * True for a same-origin path ("/x"), false for "//host", "/\host", absolute URLs,
 * and anything with control characters (URL parsing strips tab/CR/LF, so
 * "/\t/evil.com" would otherwise resolve to //evil.com).
 */
export function isSafeNextPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;
  try {
    return new URL(value, BASE).origin === BASE;
  } catch {
    return false;
  }
}
