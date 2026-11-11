import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "@/components/dashboard/pages/OverviewPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
  head: () =>
    buildPageHead({
      title: "Overview",
      description: "Your WUMY invitations overview.",
      path: "/dashboard",
      noIndex: true,
    }),
});
