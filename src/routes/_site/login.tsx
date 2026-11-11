import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/site/pages/LoginPage";
import { isSafeNextPath } from "@/lib/safe-redirect";
import { buildPageHead } from "@/lib/seo";

type LoginSearch = {
  next?: string | undefined;
  mode?: "login" | "signup" | undefined;
};

export const Route = createFileRoute("/_site/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const result: LoginSearch = {};
    if (isSafeNextPath(search["next"])) {
      result.next = search["next"];
    }
    if (search["mode"] === "signup") {
      result.mode = "signup";
    } else if (search["mode"] === "login") {
      result.mode = "login";
    }
    return result;
  },
  component: LoginPage,
  head: () =>
    buildPageHead({
      title: "Masuk",
      description: "Masuk atau daftar akun WUMY.",
      path: "/login",
      noIndex: true,
    }),
});
