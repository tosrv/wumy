import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy demo URL — keep bookmark-friendly redirect to catalog demo. */
export const Route = createFileRoute("/invite/deni-bella")({
  beforeLoad: () => {
    throw redirect({
      to: "/demo/$templateId",
      params: { templateId: "traditional" },
      search: { to: "Deni-Bella" },
    });
  },
});
