import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { listMyInvitations } from "@/lib/invitations";
import { buildPageHead } from "@/lib/seo";
import { InvitationEmptyState } from "@/components/dashboard/sections/InvitationEmptyState";

export const Route = createFileRoute("/editor/")({
  component: EditorIndexPage,
  head: () =>
    buildPageHead({
      title: "Invitation Editor",
      description: "Edit your WUMY wedding invitation.",
      path: "/editor",
      noIndex: true,
    }),
});

function EditorIndexPage() {
  const { user, configured } = useAuth();
  const navigate = useNavigate();
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Link to="/dashboard" className="text-sm font-semibold">
          ← Dashboard
        </Link>
      </main>
    );
  }

  if (empty) {
    return (
      <main className="flex min-h-svh flex-1 flex-col bg-background">
        <InvitationEmptyState
          centered
          description="Create a draft invitation to open the editor from this menu."
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Opening editor…</p>
    </main>
  );
}
