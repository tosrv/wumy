import type { InvitationViewModel } from "@/components/invitations/types";
import { numberSections } from "@/templates/shared/section-numbers";

export type SectionKey = "couple" | "countdown" | "events" | "story" | "gallery" | "gifts" | "rsvp";

/**
 * Kicker numbers (1..n) for the numbered sections that actually render, in
 * render order. Hidden sections are absent; the checks mirror each section's
 * own `return null`.
 */
export function sectionNumbers(
  data: Pick<InvitationViewModel, "weddingDateIso" | "events" | "story" | "photoUrls" | "gifts">,
): Partial<Record<SectionKey, number>> {
  const present: (readonly [SectionKey, boolean])[] = [
    ["couple", true],
    ["countdown", !!data.weddingDateIso],
    ["events", data.events.length > 0],
    ["story", !!data.story.trim()],
    ["gallery", data.photoUrls.length > 0],
    ["gifts", data.gifts.length > 0],
    ["rsvp", true],
  ];
  return numberSections(present);
}
