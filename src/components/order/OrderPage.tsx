import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTemplateById, invitationTemplates } from "@/data/templates";
import type { InvitationRow } from "@/lib/invitations";
import { checkoutErrorMessage, startPublishCheckout, usePaymentConfig } from "@/lib/billing";
import { formatIdr } from "@/lib/pricing";
import { whatsappUrl } from "@/lib/contact";
import { track } from "@/lib/analytics";

export const REFUND_NOTE =
  "Refund penuh selama undangan belum pernah tayang, paling lambat 7 hari setelah pembayaran, apa pun alasannya.";

interface OrderPageProps {
  invitation: InvitationRow;
  onTemplateChange: (templateId: string) => void;
}

export function OrderPage({ invitation, onTemplateChange }: OrderPageProps) {
  const template = getTemplateById(invitation.template_id) ?? invitationTemplates[0]!;
  const { available, priceIdr } = usePaymentConfig();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payingRef = useRef(false);

  async function pay() {
    if (payingRef.current) return;
    payingRef.current = true;
    setPaying(true);
    setError(null);
    try {
      const url = await startPublishCheckout(invitation.id);
      track("checkout_start", { amount: priceIdr, source: "order" });
      window.location.assign(url);
    } catch (err) {
      setError(checkoutErrorMessage(err));
      setPaying(false);
      payingRef.current = false;
    }
  }

  return (
    <main className="flex min-h-svh justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-md flex-col gap-5">
        <h1 className="font-display text-2xl font-bold tracking-tight">Pesanan undangan</h1>

        <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
          <img
            src={`/templates/${template.id}.png`}
            alt={`Template ${template.name}`}
            className="aspect-[3/4] w-full object-cover object-top"
          />
          <div className="flex flex-col gap-3 p-4">
            <p className="font-semibold">{template.name}</p>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Ganti template</span>
              <select
                className="h-10 rounded-lg border border-border bg-background px-3"
                value={template.id}
                disabled={paying}
                onChange={(e) => onTemplateChange(e.target.value)}
              >
                {invitationTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-2xl font-bold">{formatIdr(priceIdr)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{REFUND_NOTE}</p>
        </div>

        {available === true ? (
          <Button
            type="button"
            className="h-12 rounded-xl bg-accent font-bold text-accent-foreground hover:bg-accent/90"
            disabled={paying}
            onClick={() => void pay()}
          >
            {paying ? "Mengalihkan ke DOKU…" : "Bayar sekarang"}
          </Button>
        ) : available === false ? (
          <div className="rounded-2xl bg-secondary/60 p-4 text-sm">
            <p className="font-semibold">Pembayaran online segera hadir</p>
            <p className="mt-1 text-muted-foreground">
              Sementara itu, pesan lewat{" "}
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground underline"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">Memuat pembayaran…</p>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
