import { createFileRoute } from "@tanstack/react-router";
import { BillingPage } from "@/components/dashboard/pages/BillingPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
  head: () =>
    buildPageHead({
      title: "Billing",
      description: "Payment history and invoices for WUMY.",
      path: "/dashboard/billing",
      noIndex: true,
    }),
});
