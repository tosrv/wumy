import { Outlet, createFileRoute } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/invitation")({
  component: InvitationLayout,
  head: () =>
    buildPageHead({
      title: "Invitation",
      description: "Edit wedding details, photos, and love story.",
      path: "/dashboard/invitation",
      noIndex: true,
    }),
});

function InvitationLayout() {
  return <Outlet />;
}
