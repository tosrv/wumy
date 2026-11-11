import type { InvitationViewModel } from "@/components/invitations/types";
import { numberSections } from "@/templates/shared/section-numbers";

export type SectionKey =
  | "opening"
  | "couple"
  | "countdown"
  | "events"
  | "story"
  | "gallery"
  | "gifts"
  | "rsvp"
  | "closing";

/**
 * Index numbers (1..n) for the sections that actually render, in render
 * order. The checks mirror each section's own `return null`.
 */
export function sectionNumbers(
  data: Pick<
    InvitationViewModel,
    "greeting" | "quote" | "weddingDateIso" | "events" | "story" | "photoUrls" | "gifts"
  >,
): Partial<Record<SectionKey, number>> {
  return numberSections<SectionKey>([
    ["opening", !!data.greeting.trim() || !!data.quote.trim()],
    ["couple", true],
    ["countdown", !!data.weddingDateIso],
    ["events", data.events.length > 0],
    ["story", !!data.story.trim()],
    ["gallery", data.photoUrls.length > 0],
    ["gifts", data.gifts.length > 0],
    ["rsvp", true],
    ["closing", true],
  ]);
}
