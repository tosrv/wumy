import { createFileRoute } from "@tanstack/react-router";
import { AdminActivityPage } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/activity")({
  component: AdminActivityPage,
});
