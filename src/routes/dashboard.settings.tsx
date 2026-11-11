import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/dashboard/pages/SettingsPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
  head: () =>
    buildPageHead({
      title: "Settings",
      description: "Account settings for WUMY.",
      path: "/dashboard/settings",
      noIndex: true,
    }),
});
