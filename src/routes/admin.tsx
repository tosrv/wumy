import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/admin/AdminPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () =>
    buildPageHead({
      title: "Admin",
      description: "WUMY admin.",
      path: "/admin",
      noIndex: true,
    }),
});
