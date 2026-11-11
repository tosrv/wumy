import { track } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  PAYMENT_POLL_MS,
  PAYMENT_TIMEOUT_MS,
  paymentStatusView,
  type PaymentStatusView,
} from "./payment-status";

type Row = { status: string; invitation_id: string; amount_cents: number };

export function PaymentStatusPage({ invoice }: { invoice: string }) {
  const [row, setRow] = useState<Row | null>(null);

  const [started] = useState(() => Date.now());
  const [now, setNow] = useState(started);
  const hasInvoice = invoice.trim() !== "";
  const view: PaymentStatusView = paymentStatusView(row, now - started, hasInvoice);
  const done =
    !hasInvoice || view === "paid" || view === "timeout" || now - started >= PAYMENT_TIMEOUT_MS;

  // Clock: drives waiting -> unknown/timeout even if a request hangs.
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [done]);

  // Poll payments by invoice number every 3 s until paid or timed out.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !invoice || done) return;
    let cancelled = false;
    let inFlight = false;
    async function poll() {
      if (inFlight || !supabase) return;
      inFlight = true;
      try {
        const { data } = await supabase
          .from("payments")
          .select("status, invitation_id, amount_cents")
          .eq("invoice_number", invoice)
          .maybeSingle();
        if (!cancelled && data) setRow(data);
      } catch {
        // transient; retry on next tick
      } finally {
        inFlight = false;
      }
    }
    void poll();
    const id = setInterval(() => void poll(), PAYMENT_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [invoice, done]);

  const paidInvitationId = view === "paid" ? (row?.invitation_id ?? null) : null;

  // Count each invoice once, even if the status page is reloaded.
  const paidAmount = view === "paid" && row ? row.amount_cents / 100 : null;
  useEffect(() => {
    if (paidAmount == null) return;
    const key = `wumy:paid-tracked:${invoice}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: track anyway (worst case a reload counts twice).
    }
    track("paid", { amount: paidAmount });
  }, [paidAmount, invoice]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-sm">
        {view === "waiting" && (
          <>
            <h1 className="font-display text-2xl font-bold">Menunggu konfirmasi pembayaran…</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Halaman ini akan diperbarui otomatis setelah pembayaran Anda dikonfirmasi DOKU.
            </p>
          </>
        )}
        {view === "paid" && (
          <>
            <h1 className="font-display text-2xl font-bold">Pembayaran berhasil</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Terima kasih! Sekarang isi detail undanganmu, lalu terbitkan saat sudah siap.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              {paidInvitationId ? (
                <Link to="/editor/$invitationId" params={{ invitationId: paidInvitationId }}>
                  Mulai isi undangan
                </Link>
              ) : (
                <Link to="/dashboard">Ke dashboard</Link>
              )}
            </Button>
          </>
        )}
        {(view === "timeout" || view === "unknown") && (
          <>
            <h1 className="font-display text-2xl font-bold">
              {view === "unknown" ? "Pembayaran tidak ditemukan" : "Belum ada konfirmasi"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {view === "unknown"
                ? "Kami belum menemukan data pembayaran ini. Pastikan Anda masuk dengan akun yang sama."
                : "Konfirmasi dari DOKU belum kami terima. Jika Anda sudah membayar, coba muat ulang beberapa saat lagi."}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild className="rounded-xl">
                <Link to="/order">Coba lagi</Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => window.location.reload()}
              >
                Muat ulang
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
