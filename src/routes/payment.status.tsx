import { createFileRoute } from "@tanstack/react-router";
import { PaymentStatusPage } from "@/components/payments/PaymentStatusPage";
import { buildPageHead } from "@/lib/seo";

type PaymentStatusSearch = { invoice?: string | undefined };

export const Route = createFileRoute("/payment/status")({
  component: PaymentStatusRoute,
  validateSearch: (search: Record<string, unknown>): PaymentStatusSearch => {
    const invoice = search["invoice"];
    return typeof invoice === "string" && invoice ? { invoice } : {};
  },
  head: () =>
    buildPageHead({
      title: "Status pembayaran",
      description: "Status pembayaran undangan WUMY.",
      path: "/payment/status",
      noIndex: true,
    }),
});

function PaymentStatusRoute() {
  const { invoice } = Route.useSearch();
  return <PaymentStatusPage invoice={invoice ?? ""} />;
}
