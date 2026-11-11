import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { listMyInvitations } from "@/lib/invitations";
import { InvitationEmptyState } from "@/components/dashboard/sections/InvitationEmptyState";

/** Resolves the primary invitation and opens the standalone editor. */
export function InvitationHubPage() {
  const { user, configured } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!user || !configured) return;
    let cancelled = false;

    void (async () => {
      try {
        const rows = await listMyInvitations();
        if (cancelled) return;
        const primary = rows[0];
        if (!primary) {
          setEmpty(true);
          return;
        }
        void navigate({
          to: "/editor/$invitationId",
          params: { invitationId: primary.id },
          replace: true,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, configured, navigate]);

  if (error) {
    return (
      <main className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Link
          to="/dashboard"
          className="text-sm font-semibold hover:text-muted-foreground"
        >
          ← Back to overview
        </Link>
      </main>
    );
  }

  if (empty) {
    return (
      <main className="flex min-h-full flex-1 flex-col">
        <InvitationEmptyState
          centered
          description="Create a draft invitation to open the editor from this menu."
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-[40vh] items-center justify-center px-6">
      <p className="text-sm text-muted-foreground">Opening invitation editor…</p>
    </main>
  );
}
