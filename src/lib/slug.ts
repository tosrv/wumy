const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Top-level paths owned by the app (current routes plus names kept for future ones).
 * An invitation with one of these slugs would be unreachable at `/<slug>`.
 * Keep in sync with `public.reserved_slugs()` in supabase/schema.sql.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "about",
  "admin",
  "api",
  "app",
  "billing",
  "contact",
  "create",
  "dashboard",
  "demo",
  "editor",
  "faq",
  "forgot-password",
  "help",
  "i",
  "invite",
  "login",
  "p",
  "payment",
  "privacy",
  "product",
  "refund",
  "reset-password",
  "settings",
  "terms",
  "www",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

/** Dependency-free so server code can validate slugs without the browser client. */
export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length >= 3 && slug.length <= 64 && !RESERVED_SLUGS.has(slug);
}
