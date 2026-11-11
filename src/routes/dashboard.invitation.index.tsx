import { createFileRoute } from "@tanstack/react-router";
import { InvitationHubPage } from "@/components/dashboard/pages/InvitationHubPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/invitation/")({
  component: InvitationHubPage,
  head: () =>
    buildPageHead({
      title: "Invitation",
      description: "Manage your wedding invitations.",
      path: "/dashboard/invitation",
      noIndex: true,
    }),
});
