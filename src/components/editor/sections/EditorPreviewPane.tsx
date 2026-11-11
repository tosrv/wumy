import { Check, Laptop, Smartphone } from "lucide-react";
import {
  getTemplateStyleClass,
  invitationTemplates,
  type InvitationTemplate,
} from "@/data/templates";
import {
  hasInvitationRenderer,
  InvitationTemplateRenderer,
} from "@/components/invitations/InvitationTemplateRenderer";
import type { InvitationViewModel } from "@/components/invitations/types";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { cn } from "@/lib/utils";

interface EditorPreviewPaneProps {
  template: InvitationTemplate | undefined;
  viewModel: InvitationViewModel;
  device: "mobile" | "web";
  onDeviceChange: (device: "mobile" | "web") => void;
  demoUrl?: string;
}

export function EditorPreviewPane({
  template,
  viewModel,
  device,
  onDeviceChange,
  demoUrl,
}: EditorPreviewPaneProps) {
  return (
    <section className="flex w-full flex-col items-center justify-start overflow-y-auto bg-background p-6 lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)] lg:w-[48%] lg:p-10">
      <div className="mb-5 flex w-full max-w-[420px] items-center justify-between rounded-xl bg-card px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1 rounded-xl bg-secondary/70 p-1">
          <button
            type="button"
            onClick={() => onDeviceChange("mobile")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              device === "mobile"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Smartphone className="size-4" />
            Mobile
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange("web")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              device === "web"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Laptop className="size-4" />
            Web
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-accent/30 px-2.5 py-1 text-[11px] font-semibold text-accent-foreground sm:inline-flex">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Live Preview
          </span>
          {demoUrl && template && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-xl bg-secondary/70 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Open preview in new tab"
            >
              <span className="text-sm">↗</span>
            </a>
          )}
        </div>
      </div>

      <div className="mb-3 flex w-full max-w-[390px] items-center justify-center gap-1.5 rounded-lg bg-secondary/80 px-3 py-1.5 text-center text-[12px] font-semibold text-muted-foreground">
        Preview updates as you edit
      </div>

      {device === "mobile" ? (
        <PhoneMockup>
          <PreviewBody template={template} viewModel={viewModel} />
        </PhoneMockup>
      ) : (
        <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="max-h-[730px] overflow-y-auto">
            <PreviewBody template={template} viewModel={viewModel} />
          </div>
        </div>
      )}
    </section>
  );
}

function PreviewBody({
  template,
  viewModel,
}: {
  template: InvitationTemplate | undefined;
  viewModel: InvitationViewModel;
}) {
  if (!template) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Pick a template to preview
      </div>
    );
  }

  if (hasInvitationRenderer(template.id)) {
    return (
      <InvitationTemplateRenderer
        data={viewModel}
        startOpened
        embedded
      />
    );
  }

  return (
    <div
      className={cn(
        "template-card template-card--demo mx-auto my-8 max-w-sm",
        getTemplateStyleClass(template.categoryId),
      )}
    >
      <div className="template-inner">
        <p className="template-kicker">Together with their families</p>
        <p className="template-couple">
          {viewModel.partnerAName}
          {"\n+\n"}
          {viewModel.partnerBName}
        </p>
        <div className="my-2 h-px w-14 bg-current opacity-30" />
        <p className="template-date">{viewModel.weddingDateLabel}</p>
        <p className="template-place">
          {[viewModel.venueName, viewModel.venueAddress]
            .filter(Boolean)
            .join(" · ") || template.place}
        </p>
      </div>
    </div>
  );
}

interface ThemeStepProps {
  templateId: string;
  onSelect: (id: string) => void;
  partnerAName: string;
  partnerBName: string;
}

export function EditorThemeStep({
  templateId,
  onSelect,
  partnerAName,
  partnerBName,
}: ThemeStepProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-sm lg:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Choose Wedding Aesthetic
        </h2>
        <span className="text-[11px] font-bold text-muted-foreground">
          {invitationTemplates.length} styles
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {invitationTemplates.map((item) => {
          const active = item.id === templateId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "relative flex flex-col gap-2.5 rounded-xl bg-secondary/50 p-3.5 text-left transition-all hover:shadow-md",
                active
                  ? "bg-secondary ring-2 ring-accent shadow-sm"
                  : "hover:bg-secondary",
              )}
            >
              <div
                className={cn(
                  "template-card relative aspect-[4/3] overflow-hidden rounded-lg",
                  getTemplateStyleClass(item.categoryId),
                )}
              >
                <div className="template-inner scale-90">
                  <p className="template-couple text-sm leading-tight">
                    {partnerAName || item.couple.split(" + ")[0] || "A"}
                    {"\n+\n"}
                    {partnerBName || item.couple.split(" + ")[1] || "B"}
                  </p>
                </div>
                {active && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm">
                    <Check className="size-3.5" />
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold">{item.name}</span>
                {active && (
                  <span className="rounded bg-accent/50 px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[13px] leading-snug text-muted-foreground">
                {item.vibe}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
