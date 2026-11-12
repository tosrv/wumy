import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { OrderPage } from "@/components/order/OrderPage";
import { ensureOrderInvitation } from "@/lib/order";
import type { InvitationRow } from "@/lib/invitations";
import { useAuth } from "@/lib/auth";
import { buildPageHead } from "@/lib/seo";
import { track } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/contact";

type OrderSearch = { template?: string };

export const Route = createFileRoute("/order")({
  validateSearch: (search: Record<string, unknown>): OrderSearch => {
    const raw = search["template"];
    return typeof raw === "string" && raw !== "" ? { template: raw } : {};
  },
  component: OrderRoute,
  head: () =>
    buildPageHead({
      title: "Pesanan",
      description: "Pesan undangan pernikahan digital WUMY.",
      path: "/order",
      noIndex: true,
    }),
});

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      {children}
    </main>
  );
}

function OrderRoute() {
  const { template } = Route.useSearch();
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track("order_view", template ? { template } : {});
  }, [template]);

  useEffect(() => {
    if (loading || !configured || user) return;
    const next = template ? `/order?template=${encodeURIComponent(template)}` : "/order";
    void router.navigate({ to: "/login", search: { mode: "signup", next }, replace: true });
  }, [loading, configured, user, template, router]);

  useEffect(() => {
    if (loading || !configured || !user) return;
    let cancelled = false;
    setError(null);
    ensureOrderInvitation(user.id, template)
      .then(({ invitation: inv, redirectToEditor }) => {
        if (cancelled) return;
        if (redirectToEditor) {
          void router.navigate({
            to: "/editor/$invitationId",
            params: { invitationId: inv.id },
            replace: true,
          });
          return;
        }
        setInvitation(inv);
      })
      .catch((err: unknown) => {
        console.error("Order could not be opened:", err);
        if (!cancelled) setError("Pesanan tidak dapat dibuka. Coba muat ulang halaman ini.");
      });
    return () => {
      cancelled = true;
    };
  }, [loading, configured, user, template, router]);

  if (!configured) {
    return (
      <Centered>
        <h1 className="font-display text-2xl font-bold">Pemesanan belum tersedia</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Layanan akun belum dikonfigurasi. Hubungi kami lewat{" "}
          <a
            href={whatsappUrl()}
            className="font-semibold underline"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          .
        </p>
      </Centered>
    );
  }

  if (error) {
    return (
      <Centered>
        <h1 className="font-display text-2xl font-bold">Ada kendala</h1>
        <p role="alert" className="max-w-md text-sm text-muted-foreground">
          {error} Jika masih gagal, hubungi kami lewat{" "}
          <a
            href={whatsappUrl()}
            className="font-semibold underline"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          .
        </p>
        <Link to="/" className="text-sm font-semibold underline">
          Kembali ke beranda
        </Link>
      </Centered>
    );
  }

  if (!invitation) {
    return (
      <Centered>
        <p className="text-muted-foreground">Menyiapkan pesanan…</p>
      </Centered>
    );
  }

  return (
    <OrderPage
      invitation={invitation}
      onTemplateChange={(id) =>
        void router.navigate({ to: "/order", search: { template: id }, replace: true })
      }
    />
  );
}
