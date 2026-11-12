import { createFileRoute } from "@tanstack/react-router";
import { AdminPaymentsPage } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPaymentsPage,
});
