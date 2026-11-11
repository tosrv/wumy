import { z } from "zod";
import {
  contentDraftSchema,
  newId,
  type ContentEvent,
  type InvitationContent,
} from "@/lib/invitation-content";
import { legacyColumnsFromContent, parseContent } from "@/lib/invitation-content-io";
import type { InvitationRow, InvitationUpdate, WeddingDetailsInput } from "@/lib/invitations";

export type EditorFormValues = InvitationContent & {
  templateId: string;
  slug: string;
  story: string;
};

/**
 * Lenient draft schema for the whole form. Composed with `.and()` because
 * `contentDraftSchema` is a pipe (no `.extend()`); the intersection merges the
 * content object with the three invitation-row fields.
 */
export const editorFormSchema: z.ZodType<EditorFormValues, unknown> = contentDraftSchema.and(
  z.object({
    templateId: z.string().catch(""),
    slug: z.string().catch(""),
    story: z.string().catch(""),
  }),
);

export function toFormValues(row: InvitationRow): EditorFormValues {
  return {
    ...parseContent(row),
    templateId: row.template_id,
    slug: row.slug,
    story: row.story,
  };
}

export function contentFromValues(v: EditorFormValues): InvitationContent {
  const { templateId, slug, story, ...content } = v;
  return content;
}

export function toUpdatePayload(v: EditorFormValues): InvitationUpdate {
  const content = contentFromValues(v);
  return {
    template_id: v.templateId,
    slug: v.slug,
    story: v.story,
    content,
    ...legacyColumnsFromContent(content),
  };
}

/** Adapter for `updateInvitation`, which still takes the legacy details shape. */
export function toDetailsInput(v: EditorFormValues): WeddingDetailsInput {
  const p = toUpdatePayload(v);
  return {
    templateId: v.templateId,
    slug: v.slug,
    story: v.story,
    partnerAName: p.partner_a_name ?? "",
    partnerBName: p.partner_b_name ?? "",
    weddingDate: p.wedding_date ?? "",
    venueName: p.venue_name ?? "",
    venueAddress: p.venue_address ?? "",
  };
}

/** A first event for the temporary single-event UI, used when `events[0]` is missing. */
export function blankEvent(locale: InvitationContent["locale"]): ContentEvent {
  return {
    id: newId(),
    kind: "resepsi",
    title: locale === "en" ? "Reception" : "Resepsi",
    date: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    mapsUrl: "",
  };
}
