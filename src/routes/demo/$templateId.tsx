import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { TemplateDemoView } from "@/components/invitations/TemplateDemoView";
import { getTemplateById, templateExists } from "@/data/templates";
import { buildPageHead } from "@/lib/seo";

type DemoSearch = {
  to?: string;
};

export const Route = createFileRoute("/demo/$templateId")({
  validateSearch: (search: Record<string, unknown>): DemoSearch => {
    const raw = search["to"];
    if (typeof raw === "string" && raw.trim()) {
      return { to: raw.trim().slice(0, 80) };
    }
    return {};
  },
  beforeLoad: ({ params }) => {
    if (!templateExists(params.templateId)) {
      throw notFound();
    }
  },
  component: DemoPage,
  head: ({ params }) => {
    const template = getTemplateById(params.templateId);
    const name = template?.name ?? "Template";
    return buildPageHead({
      title: `${name} demo`,
      description: `Full preview of the WUMY ${name} wedding invitation template. Pick a vibe, then create yours.`,
      path: `/demo/${params.templateId}`,
    });
  },
});

function DemoPage() {
  const { templateId } = Route.useParams();
  const { to: guestName } = Route.useSearch();
  const template = getTemplateById(templateId);

  useEffect(() => {
    if (template) track("demo_view", { template: template.id });
  }, [template]);

  if (!template) {
    throw notFound();
  }

  return (
    <TemplateDemoView
      template={template}
      {...(guestName ? { guestName } : {})}
    />
  );
}
