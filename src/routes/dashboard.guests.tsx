import { createFileRoute } from "@tanstack/react-router";
import { GuestsPage } from "@/components/dashboard/pages/GuestsPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/guests")({
  component: GuestsPage,
  head: () =>
    buildPageHead({
      title: "Guest List",
      description: "Manage guests and personalized invitation links.",
      path: "/dashboard/guests",
      noIndex: true,
    }),
});
