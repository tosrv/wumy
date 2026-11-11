import { absoluteUrl, getSiteUrl } from "@/lib/seo";

/** Host only, e.g. `wumy.id` or `localhost:5173`. */
export function getPublicHost(): string {
  return getSiteUrl().replace(/^https?:\/\//, "");
}

/** Path for a published invite: `/{slug}`. */
export function invitationPath(slug: string): string {
  const clean = slug.replace(/^\/+/, "");
  return `/${clean}`;
}

/** Absolute invite URL (uses `VITE_SITE_URL`). */
export function invitationPublicUrl(slug: string): string {
  return absoluteUrl(invitationPath(slug));
}

/** Display form for UI: `host/slug`. */
export function invitationPublicDisplay(slug: string): string {
  return `${getPublicHost()}${invitationPath(slug)}`;
}

/** Personalized path: `/{slug}?to=key`. */
export function guestInvitationPath(slug: string, toKey: string): string {
  return `${invitationPath(slug)}?to=${encodeURIComponent(toKey)}`;
}

/** Absolute personalized guest URL. */
export function guestInvitationPublicUrl(slug: string, toKey: string): string {
  return absoluteUrl(guestInvitationPath(slug, toKey));
}

/** Display form: `host/slug?to=key`. */
export function guestInvitationDisplay(slug: string, toKey: string): string {
  return `${getPublicHost()}${guestInvitationPath(slug, toKey)}`;
}

/** Order entry (pay first, then edit) — optional template preselect. */
export function orderPath(templateId?: string): string {
  if (!templateId?.trim()) return "/order";
  return `/order?template=${encodeURIComponent(templateId.trim())}`;
}
