import { useState } from "react";
import type { FormEvent } from "react";
import { submitPublicRsvp } from "@/lib/invitations";

export function PublicRsvpBlock({
  invitationId,
  initialGuestName,
  guestId,
}: {
  invitationId: string;
  initialGuestName?: string;
  guestId?: string;
}) {
  const [guestName, setGuestName] = useState(initialGuestName ?? "");
  const [status, setStatus] = useState<"coming" | "not_coming" | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!status) {
      setError("Pilih kehadiran Anda.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitPublicRsvp({
        invitationId,
        guestName,
        status,
        message,
        guestId: guestId ?? null,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim RSVP.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Terima kasih — konfirmasi Anda sudah kami terima.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3">
      <input
        required
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        placeholder="Nama Anda"
        className="h-12 rounded-xl border border-border bg-card px-4 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStatus("coming")}
          className={`flex-1 rounded-xl border py-3 text-sm ${
            status === "coming"
              ? "border-foreground bg-foreground text-background"
              : "border-border"
          }`}
        >
          Hadir
        </button>
        <button
          type="button"
          onClick={() => setStatus("not_coming")}
          className={`flex-1 rounded-xl border py-3 text-sm ${
            status === "not_coming"
              ? "border-foreground bg-foreground text-background"
              : "border-border"
          }`}
        >
          Tidak hadir
        </button>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ucapan & doa (opsional)"
        rows={3}
        className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-accent py-3 text-sm font-bold text-accent-foreground disabled:opacity-50"
      >
        {busy ? "Mengirim…" : "Kirim konfirmasi"}
      </button>
    </form>
  );
}
