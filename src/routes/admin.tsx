import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminPages";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () =>
    buildPageHead({
      title: "Admin",
      description: "WUMY admin.",
      path: "/admin",
      noIndex: true,
    }),
});
