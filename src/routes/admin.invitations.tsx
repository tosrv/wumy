import { createFileRoute } from "@tanstack/react-router";
import { AdminInvitationsPage } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/invitations")({
  component: AdminInvitationsPage,
});
