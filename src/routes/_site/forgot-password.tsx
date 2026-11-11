import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/components/site/pages/ForgotPasswordPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/forgot-password")({
  component: ForgotPasswordPage,
  head: () =>
    buildPageHead({
      title: "Lupa kata sandi",
      description: "Atur ulang kata sandi akun WUMY.",
      path: "/forgot-password",
      noIndex: true,
    }),
});
