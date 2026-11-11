import { Link } from "@tanstack/react-router";
import { getCategoryById, getTemplateStyleClass, type InvitationTemplate } from "@/data/templates";
import {
  hasInvitationRenderer,
  InvitationTemplateRenderer,
} from "@/components/invitations/InvitationTemplateRenderer";
import { viewModelFromCatalog } from "@/components/invitations/types";
import { orderPath } from "@/lib/urls";
import { A } from "@/components/A";

interface TemplateDemoViewProps {
  template: InvitationTemplate;
  guestName?: string;
}

export function TemplateDemoView({ template, guestName }: TemplateDemoViewProps) {
  const category = getCategoryById(template.categoryId);
  const fullRenderer = hasInvitationRenderer(template.id);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-16 sm:pb-0">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/product"
              className="shrink-0 text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
            >
              ← Templates
            </Link>
            <span className="hidden text-border sm:inline" aria-hidden="true">
              /
            </span>
            <p className="truncate text-sm text-muted-foreground">
              {category && (
                <>
                  <span className="text-muted-foreground/80">{category.label}</span>
                  <span className="mx-1.5">·</span>
                </>
              )}
              <span className="font-semibold text-foreground">{template.name}</span> demo
            </p>
          </div>
          <A
            href={orderPath(template.id)}
            data-path="order"
            className="hidden shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-5 sm:inline-flex py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            Gunakan template ini
            <span aria-hidden="true">→</span>
          </A>
        </div>
      </header>

      {fullRenderer ? (
        <main className="flex-1">
          <InvitationTemplateRenderer data={viewModelFromCatalog(template, guestName)} />
          <p className="border-t border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
            Full template preview
            {guestName ? ` · personalized for “${guestName}”` : ""}. Try{" "}
            <Link
              to="/demo/$templateId"
              params={{ templateId: template.id }}
              search={{ to: "Budi" }}
              className="font-semibold text-foreground underline-offset-2 hover:underline"
            >
              ?to=Budi
            </Link>{" "}
            for guest greeting. RSVP unlocks after publish.
          </p>
        </main>
      ) : (
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:px-6 md:py-12">
          <div className="w-full max-w-md">
            <div
              className={`template-card template-card--demo ${getTemplateStyleClass(template.categoryId)}`}
              role="img"
              aria-label={`${template.name} invitation demo`}
            >
              <div className="template-inner">
                <p className="template-kicker">Together with their families</p>
                <p className="template-couple">{template.couple}</p>
                <div className="my-2 h-px w-14 bg-current opacity-30" />
                <p className="template-date">{template.date}</p>
                <p className="template-place">{template.place}</p>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Card preview — full-page layout coming for this style. Try{" "}
              <Link
                to="/demo/$templateId"
                params={{ templateId: "minimal" }}
                className="font-semibold text-foreground underline-offset-2 hover:underline"
              >
                Minimal
              </Link>{" "}
              for the live template.
            </p>
          </div>
        </main>
      )}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 px-4 py-2.5 backdrop-blur sm:hidden">
        <A
          href={orderPath(template.id)}
          data-path="order"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground active:scale-95"
        >
          Gunakan template ini
          <span aria-hidden="true">→</span>
        </A>
      </div>
    </div>
  );
}
