import { createFileRoute } from "@tanstack/react-router";
import { EditorLoader } from "@/components/editor/pages/EditorLoader";
import { buildPageHead } from "@/lib/seo";
import type { EditorStepId } from "@/components/editor/sections/EditorStepHeader";
import { parseStepParam } from "@/components/editor/step-states";

type EditorSearch = { step?: EditorStepId | undefined };

export const Route = createFileRoute("/editor/$invitationId")({
  component: EditorRoute,
  validateSearch: (search: Record<string, unknown>): EditorSearch => {
    const step = parseStepParam(search["step"]);
    return step ? { step } : {};
  },
  head: ({ params }) =>
    buildPageHead({
      title: "Edit invitation",
      description: "Update wedding details, photos, and story.",
      path: `/editor/${params.invitationId}`,
      noIndex: true,
    }),
});

function EditorRoute() {
  const { invitationId } = Route.useParams();
  return <EditorLoader invitationId={invitationId} />;
}
