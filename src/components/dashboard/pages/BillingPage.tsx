import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CreditCard, FileText, Receipt } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { listMyInvitations, type InvitationRow } from "@/lib/invitations";
import {
  formatPublishPrice,
  usePaymentConfig,
  listPaymentsForInvitations,
  type PaymentRow,
} from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { invitationStatusLabel } from "@/components/dashboard/sections/invitationStatus";

function formatAmount(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `${currency.toUpperCase()} ${(cents / 100).toLocaleString("id-ID")}`;
  }
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function BillingPage() {
  const { user, configured } = useAuth();
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentConfig = usePaymentConfig();
  const available = paymentConfig.available === true;
  useEffect(() => {
    if (!user || !configured) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const rows = await listMyInvitations();
        if (cancelled) return;
        setInvitations(rows);
        const payRows = await listPaymentsForInvitations(rows.map((r) => r.id));
        if (!cancelled) setPayments(payRows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load billing.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, configured]);

  const paidCount = invitations.filter((i) => i.payment_status === "paid").length;
  const priceLabel = formatPublishPrice(paymentConfig.priceIdr);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 pb-16 md:px-8 md:py-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Billing
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              One-time publish fee ({priceLabel}).{" "}
              {available
                ? "Bayar untuk membuka tautan publik undangan Anda."
                : "Online payment is coming soon — your drafts are saved meanwhile."}
            </p>
          </div>
          <Button
            asChild
            className="h-10 shrink-0 self-start rounded-xl bg-accent font-bold text-accent-foreground shadow-sm hover:bg-accent/90 lg:self-auto"
          >
            <Link to="/dashboard/help">Need help with a payment?</Link>
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading billing…</p>}
        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        )}

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Invitations
            </span>
            <p className="mt-4 font-display text-4xl font-extrabold tracking-tight">
              {invitations.length}
            </p>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Paid
            </span>
            <p className="mt-4 font-display text-4xl font-extrabold tracking-tight">{paidCount}</p>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Transactions
            </span>
            <p className="mt-4 font-display text-4xl font-extrabold tracking-tight">
              {payments.length}
            </p>
          </div>
        </div>

        <section className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">Invitation payment status</h2>
          </div>

          {invitations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No invitations yet. Create one to see payment status here.
              </p>
              <Link
                to="/order"
                className="mt-4 inline-flex text-sm font-semibold hover:text-muted-foreground"
              >
                Start create →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col justify-between gap-3 rounded-xl bg-secondary/50 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {inv.partner_a_name} & {inv.partner_b_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">/{inv.slug}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                        inv.payment_status === "paid"
                          ? "bg-[oklch(0.9_0.08_160)] text-[oklch(0.35_0.1_160)]"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {invitationStatusLabel(inv)}
                    </span>
                    {inv.payment_status !== "paid" && (
                      <Button
                        asChild
                        size="sm"
                        className="h-8 rounded-lg bg-accent font-bold text-accent-foreground hover:bg-accent/90"
                      >
                        <Link to="/order" search={{ template: inv.template_id }}>
                          {available ? `Bayar ${priceLabel}` : `Bayar ${priceLabel} · segera`}
                        </Link>
                      </Button>
                    )}
                    {inv.payment_status === "paid" && inv.status === "published" && (
                      <Button asChild size="sm" variant="outline" className="h-8 rounded-lg">
                        <Link to="/$slug" params={{ slug: inv.slug }}>
                          View live
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 px-6 py-5">
            <Receipt className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">Payment history</h2>
          </div>

          {payments.length === 0 ? (
            <div className="border-t border-border/50 px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <FileText className="size-6" />
              </div>
              <p className="font-semibold">No transactions yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Payments will appear here once online payment is available.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto border-t border-border/50">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Provider</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-t border-border/40 transition-colors hover:bg-secondary/40"
                    >
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3.5 font-semibold">
                        {formatAmount(payment.amount_cents, payment.currency)}
                      </td>
                      <td className="px-6 py-3.5 capitalize text-muted-foreground">
                        {payment.provider}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                          {statusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                        {payment.provider_ref || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
