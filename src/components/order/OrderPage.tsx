import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { getCategoryById, getTemplateById, invitationTemplates } from "@/data/templates";
import type { InvitationRow } from "@/lib/invitations";
import { checkoutErrorMessage, startPublishCheckout, usePaymentConfig } from "@/lib/billing";
import { formatIdr } from "@/lib/pricing";
import { whatsappUrl } from "@/lib/contact";
import { track } from "@/lib/analytics";

export const REFUND_NOTE =
  "Refund penuh selama undangan belum pernah tayang, paling lambat 7 hari setelah pembayaran, apa pun alasannya.";

/** What every invitation includes, shown under the chosen template. */
const INCLUDED = [
  "Undangan online dengan alamat sendiri (wumy.my.id/nama-kalian)",
  "Link personal untuk setiap tamu",
  "RSVP dan ucapan dari tamu",
  "Galeri foto, musik latar, dan info hadiah",
];

interface OrderPageProps {
  invitation: InvitationRow;
}

export function OrderPage({ invitation }: OrderPageProps) {
  const template = getTemplateById(invitation.template_id) ?? invitationTemplates[0]!;
  const category = getCategoryById(template.categoryId);
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Template{category ? ` · ${category.label}` : ""}
                </p>
                <p className="font-display text-xl font-bold">{template.name}</p>
              </div>
              <Link
                to="/demo/$templateId"
                params={{ templateId: template.id }}
                className="shrink-0 text-sm font-semibold underline underline-offset-2"
              >
                Lihat demo
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">{template.vibe}</p>
            <ul className="flex flex-col gap-1.5 text-sm">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {!paying && (
              <Link
                to="/product"
                className="self-start text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Pilih template lain
              </Link>
            )}
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
