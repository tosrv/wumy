import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/components/site/pages/ResetPasswordPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/reset-password")({
  component: ResetPasswordPage,
  head: () =>
    buildPageHead({
      title: "Buat kata sandi baru",
      description: "Atur ulang kata sandi akun WUMY.",
      path: "/reset-password",
      noIndex: true,
    }),
});
