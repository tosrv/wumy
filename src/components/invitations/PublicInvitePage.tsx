import { useEffect, useMemo, useState } from "react";
import {
  getPublishedInvitationBySlug,
  isValidSlug,
  listPublishedInvitationPhotos,
  resolvePublicGuest,
  submitPublicRsvp,
  type InvitationRow,
} from "@/lib/invitations";
import type { PhotoRole } from "@/lib/invitation-content";
import { parseContent } from "@/lib/invitation-content-io";
import { viewModelFromContent } from "@/components/invitations/types";
import { InvitationTemplateRenderer } from "@/components/invitations/InvitationTemplateRenderer";

type PublicInvitePageProps = {
  slug: string;
  toParam?: string;
};

export function PublicInvitePage({ slug, toParam }: PublicInvitePageProps) {
  const [invitation, setInvitation] = useState<InvitationRow | null>(null);
  const [photos, setPhotos] = useState<{ url: string; role: PhotoRole }[]>([]);
  const [guestId, setGuestId] = useState<string | undefined>();
  const [guestName, setGuestName] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setGuestId(undefined);
    setGuestName(undefined);

    void (async () => {
      try {
        if (!isValidSlug(slug)) {
          if (!cancelled) {
            setInvitation(null);
            setError("not-found");
          }
          return;
        }
        const row = await getPublishedInvitationBySlug(slug);
        if (cancelled) return;
        if (!row) {
          setInvitation(null);
          setError("not-found");
          return;
        }
        const [list, guest] = await Promise.all([
          listPublishedInvitationPhotos(row.id),
          resolvePublicGuest(row.id, toParam),
        ]);
        if (cancelled) return;
        setInvitation(row);
        setPhotos(list);
        setGuestId(guest.guestId);
        setGuestName(guest.displayName);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, toParam]);

  const viewModel = useMemo(
    () =>
      invitation
        ? viewModelFromContent({
            templateId: invitation.template_id,
            content: parseContent(invitation),
            story: invitation.story,
            photos,
            ...(guestName ? { guestName } : {}),
          })
        : null,
    [invitation, photos, guestName],
  );

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">Membuka undangan…</p>
      </main>
    );
  }

  if (error === "not-found" || !invitation) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-display text-2xl font-bold">Undangan tidak ditemukan</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Link ini mungkin salah ketik, atau undangannya belum tayang.
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6">
        <p className="text-sm text-destructive">{error}</p>
      </main>
    );
  }

  if (!viewModel) return null;

  return (
    <InvitationTemplateRenderer
      data={viewModel}
      invitationId={invitation.id}
      onSubmitRsvp={async (input) => {
        await submitPublicRsvp({
          invitationId: invitation.id,
          guestName: input.guestName,
          status: input.status,
          partySize: input.partySize,
          message: input.message,
          guestId: guestId ?? null,
        });
      }}
      {...(guestName ? { rsvpGuestName: guestName } : {})}
      {...(guestId ? { rsvpGuestId: guestId } : {})}
    />
  );
}
