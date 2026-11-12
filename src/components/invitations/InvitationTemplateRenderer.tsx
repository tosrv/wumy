import type { InvitationViewModel } from "@/components/invitations/types";
import { MinimalInvitation } from "@/templates/minimal";
import { TraditionalInvitation } from "@/templates/traditional";
import { EditorialInvitation } from "@/templates/editorial";
import { RomanticInvitation } from "@/templates/romantic";
import { PlayfulInvitation } from "@/templates/playful";
import { ModernInvitation } from "@/templates/modern";
import { PublicRsvpBlock } from "@/components/invitations/PublicRsvpBlock";

/**
 * Registry: `template.id` → `src/templates/<id>.tsx`.
 * Product grouping (filters) uses `categoryId` in `data/templates.ts`, not folders.
 */
const RENDERERS = {
  minimal: MinimalInvitation,
  traditional: TraditionalInvitation,
  editorial: EditorialInvitation,
  romantic: RomanticInvitation,
  playful: PlayfulInvitation,
  modern: ModernInvitation,
} as const;

export type RenderableTemplateId = keyof typeof RENDERERS;

export function hasInvitationRenderer(templateId: string): templateId is RenderableTemplateId {
  return templateId in RENDERERS;
}

type RsvpHandler = (input: {
  guestName: string;
  status: "coming" | "not_coming";
  message: string;
  partySize: number;
}) => Promise<void>;

export function InvitationTemplateRenderer({
  data,
  startOpened = false,
  embedded = false,
  onSubmitRsvp,
  rsvpGuestName,
  rsvpGuestId,
  invitationId,
}: {
  data: InvitationViewModel;
  startOpened?: boolean;
  embedded?: boolean;
  onSubmitRsvp?: RsvpHandler;
  rsvpGuestName?: string;
  rsvpGuestId?: string;
  /** Required for non-registered template fallback RSVP */
  invitationId?: string;
}) {
  if (hasInvitationRenderer(data.templateId)) {
    const Renderer = RENDERERS[data.templateId];
    return (
      <Renderer
        data={data}
        startOpened={startOpened}
        embedded={embedded}
        {...(onSubmitRsvp ? { onSubmitRsvp } : {})}
        {...(rsvpGuestName ? { rsvpGuestName } : {})}
      />
    );
  }

  return (
    <div className="min-h-svh bg-[oklch(0.97_0.004_95)] px-6 py-16 text-[oklch(0.16_0_0)]">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.16_0_0/0.45)]">
          Wedding invitation
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          {data.partnerAName} & {data.partnerBName}
        </h1>
        {data.guestName && (
          <p className="mt-4 text-sm text-[oklch(0.16_0_0/0.65)]">Dear {data.guestName},</p>
        )}
        <p className="mt-6 text-base text-[oklch(0.16_0_0/0.7)]">
          {data.weddingDateLabel}
          {data.venueName ? ` · ${data.venueName}` : ""}
        </p>
        {data.story && (
          <p className="mt-8 text-sm leading-relaxed text-[oklch(0.16_0_0/0.6)]">{data.story}</p>
        )}
      </div>
      {invitationId && onSubmitRsvp && (
        <div className="mt-12">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[oklch(0.16_0_0/0.45)]">
            Ucapan & RSVP
          </p>
          <PublicRsvpBlock
            invitationId={invitationId}
            {...(rsvpGuestName ? { initialGuestName: rsvpGuestName } : {})}
            {...(rsvpGuestId ? { guestId: rsvpGuestId } : {})}
          />
        </div>
      )}
    </div>
  );
}
