import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { orderRedirect } from "@/lib/order";
import { EditorPage } from "@/components/editor/pages/EditorPage";
import { useAuth } from "@/lib/auth";
import { getInvitationById, type InvitationRow } from "@/lib/invitations";

interface EditorLoaderProps {
  invitationId: string;
}

export function EditorLoader({ invitationId }: EditorLoaderProps) {
  const { user, configured } = useAuth();
  const [invitation, setInvitation] = useState<InvitationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const locked = invitation != null && orderRedirect(invitation) === "order";

  // Pay first: an unpaid invitation cannot be edited yet.
  useEffect(() => {
    if (locked) void navigate({ to: "/order", replace: true });
  }, [locked, navigate]);

  useEffect(() => {
    if (!user || !configured) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getInvitationById(invitationId)
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          setError("Undangan tidak ditemukan.");
          setInvitation(null);
          return;
        }
        setInvitation(row);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invitationId, user, configured]);

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6">
        <p className="text-muted-foreground">Memuat editor…</p>
      </main>
    );
  }

  if (error || !invitation || !user) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="font-display text-2xl font-bold">{error ?? "Undangan tidak ditemukan"}</h1>
        <Link to="/dashboard" className="text-sm font-semibold hover:text-muted-foreground">
          ← Kembali ke dashboard
        </Link>
      </main>
    );
  }

  if (locked) return null;

  return <EditorPage userId={user.id} invitation={invitation} />;
}
