import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  countInvitationGuests,
  listInvitationRsvps,
  listMyInvitations,
  type InvitationRow,
} from "@/lib/invitations";
import type { Database } from "@/lib/supabase/database.types";
import { OverviewGreeting } from "@/components/dashboard/sections/OverviewGreeting";
import { OverviewStatusBar } from "@/components/dashboard/sections/OverviewStatusBar";
import { OverviewMetrics } from "@/components/dashboard/sections/OverviewMetrics";
import { OverviewRsvpFeed } from "@/components/dashboard/sections/OverviewRsvpFeed";
import { OverviewRsvpDistribution } from "@/components/dashboard/sections/OverviewRsvpDistribution";

type RsvpRow = Database["public"]["Tables"]["rsvps"]["Row"];

export function OverviewPage() {
  const { user, configured } = useAuth();
  const [invitation, setInvitation] = useState<InvitationRow | null>(null);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [guestCount, setGuestCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !configured) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const invitations = await listMyInvitations();
        const primary = invitations[0] ?? null;
        if (cancelled) return;
        setInvitation(primary);

        if (!primary) {
          setRsvps([]);
          setGuestCount(0);
          return;
        }

        const [rsvpRows, guests] = await Promise.all([
          listInvitationRsvps(primary.id),
          countInvitationGuests(primary.id),
        ]);
        if (cancelled) return;
        setRsvps(rsvpRows);
        setGuestCount(guests);
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
  }, [user, configured]);

  const coupleLabel = invitation
    ? `${invitation.partner_a_name} & ${invitation.partner_b_name}`
    : user?.user_metadata?.["full_name"] || user?.email?.split("@")[0] || "there";

  const attending = useMemo(
    () => rsvps.filter((r) => r.status === "coming").reduce((sum, r) => sum + r.party_size, 0),
    [rsvps],
  );
  const declined = useMemo(
    () => rsvps.filter((r) => r.status === "not_coming").reduce((sum, r) => sum + r.party_size, 0),
    [rsvps],
  );
  const pendingCount = useMemo(() => rsvps.filter((r) => r.status === "pending").length, [rsvps]);

  const totalGuests = guestCount > 0 ? guestCount : attending + declined + pendingCount;
  const pending = guestCount > 0 ? Math.max(guestCount - attending - declined, 0) : pendingCount;

  const metrics = [
    {
      label: "Total Guests",
      value: totalGuests,
    },
    {
      label: "Confirmed Coming",
      value: attending,
    },
    {
      label: "Pending RSVP",
      value: pending,
    },
    {
      label: "Declined",
      value: declined,
    },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <OverviewGreeting invitation={invitation} coupleLabel={String(coupleLabel)} />

        {loading && <p className="text-sm text-muted-foreground">Loading overview…</p>}
        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && (
          <>
            {invitation ? <OverviewStatusBar invitation={invitation} /> : null}
            <OverviewMetrics metrics={metrics} />
            <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-12">
              <div className="flex flex-col gap-3.5 lg:col-span-8">
                <OverviewRsvpFeed
                  rsvps={rsvps}
                  totalLabel={String(Math.max(totalGuests, rsvps.length))}
                />
              </div>
              <div className="flex flex-col gap-3.5 lg:col-span-4">
                <OverviewRsvpDistribution
                  attending={attending}
                  pending={pending}
                  declined={declined}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
