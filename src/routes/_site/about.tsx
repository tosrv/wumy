import { createFileRoute, redirect } from "@tanstack/react-router";

/** The About page was folded into the home page; keep old links working. */
export const Route = createFileRoute("/_site/about")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
