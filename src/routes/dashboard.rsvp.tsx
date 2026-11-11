import { createFileRoute } from "@tanstack/react-router";
import { RsvpPage } from "@/components/dashboard/pages/RsvpPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/rsvp")({
  component: RsvpPage,
  head: () =>
    buildPageHead({
      title: "RSVP",
      description: "RSVP table, filters, and export for your WUMY invitation.",
      path: "/dashboard/rsvp",
      noIndex: true,
    }),
});
