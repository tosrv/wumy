import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/dashboard/pages/HelpPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/help")({
  component: HelpPage,
  head: () =>
    buildPageHead({
      title: "Help Center",
      description: "Get help and contact WUMY support.",
      path: "/dashboard/help",
      noIndex: true,
    }),
});
