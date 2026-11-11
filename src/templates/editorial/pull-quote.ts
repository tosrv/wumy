/**
 * Shortens a quote for the Editorial cover. Trims; empty → `null`; up to `max`
 * characters unchanged; otherwise cut at the last space before `max`, strip
 * trailing punctuation and append "…".
 */
export function pullQuote(quote: string, max = 90): string | null {
  const text = quote.trim();
  if (!text) return null;
  if (text.length <= max) return text;
  const space = text.lastIndexOf(" ", max);
  const cut = (space > 0 ? text.slice(0, space) : text.slice(0, max)).replace(
    /[\s.,;:!?…—–-]+$/,
    "",
  );
  return `${cut}…`;
}
