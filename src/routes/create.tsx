import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy entry point: ordering now starts at /order (pay first, then edit). */
export const Route = createFileRoute("/create")({
  validateSearch: (search: Record<string, unknown>): { template?: string } => {
    const raw = search["template"];
    return typeof raw === "string" && raw !== "" ? { template: raw } : {};
  },
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/order",
      search: search.template ? { template: search.template } : {},
      replace: true,
    });
  },
});
