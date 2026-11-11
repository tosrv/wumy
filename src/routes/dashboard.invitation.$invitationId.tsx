import { createFileRoute, redirect } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/invitation/$invitationId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/editor/$invitationId",
      params: { invitationId: params.invitationId },
      replace: true,
    });
  },
  component: () => null,
  head: ({ params }) =>
    buildPageHead({
      title: "Edit invitation",
      description: "Update wedding details, photos, and story.",
      path: `/editor/${params.invitationId}`,
      noIndex: true,
    }),
});
