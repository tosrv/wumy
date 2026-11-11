import { contentDraftSchema, type InvitationContent } from "@/lib/invitation-content";
import type { InvitationRow, InvitationUpdate } from "@/lib/invitations";

type LegacyFields = Pick<
  InvitationRow,
  "content" | "partner_a_name" | "partner_b_name" | "wedding_date" | "venue_name" | "venue_address"
>;

export const LEGACY_EVENT_ID = "legacy-event";

/** Read `row.content` leniently, then fill gaps from the legacy columns. Never throws. */
export function parseContent(row: LegacyFields): InvitationContent {
  const content = contentDraftSchema.parse(row.content);

  if (!content.partners.a.nickname) {
    content.partners.a.nickname = row.partner_a_name;
  }
  if (!content.partners.b.nickname) {
    content.partners.b.nickname = row.partner_b_name;
  }

  if (content.events.length === 0 && (row.wedding_date || row.venue_name)) {
    content.events = [
      {
        // Fixed id so repeated parses of the same row yield the same event.
        id: LEGACY_EVENT_ID,
        kind: "resepsi",
        title: content.locale === "en" ? "Reception" : "Resepsi",
        date: row.wedding_date ?? "",
        startTime: "",
        endTime: "",
        venueName: row.venue_name,
        venueAddress: row.venue_address,
        mapsUrl: "",
      },
    ];
  }

  return content;
}

/** Legacy columns kept in sync on save so dashboard lists and slug logic keep working. */
export function legacyColumnsFromContent(
  c: InvitationContent,
): Pick<
  InvitationUpdate,
  "partner_a_name" | "partner_b_name" | "wedding_date" | "venue_name" | "venue_address"
> {
  const first = c.events[0];
  return {
    partner_a_name: c.partners.a.nickname || c.partners.a.fullName,
    partner_b_name: c.partners.b.nickname || c.partners.b.fullName,
    wedding_date: first?.date || null,
    venue_name: first?.venueName ?? "",
    venue_address: first?.venueAddress ?? "",
  };
}
