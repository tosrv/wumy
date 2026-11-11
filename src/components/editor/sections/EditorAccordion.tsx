import type { ReactNode } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { AlertTriangle, ArrowRight, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/editor-i18n";
import type { Locale } from "@/lib/invitation-content";
import { EDITOR_STEPS, type EditorStepId } from "@/components/editor/sections/EditorStepHeader";
import { editorSectionDomId, type StepState } from "@/components/editor/step-states";

interface EditorAccordionProps {
  locale: Locale;
  /** The open section, or undefined when all are collapsed. Only one is open at a time. */
  openStep: EditorStepId | undefined;
  onOpenStepChange: (id: EditorStepId | undefined) => void;
  states: Record<EditorStepId, StepState>;
  summaries: Record<EditorStepId, string>;
  renderSection: (id: EditorStepId) => ReactNode;
}

/** FAQ-style accordion: one card per editor section, a single card open at a time. */
export function EditorAccordion({
  locale,
  openStep,
  onOpenStepChange,
  states,
  summaries,
  renderSection,
}: EditorAccordionProps) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      value={openStep ?? ""}
      onValueChange={(v) => onOpenStepChange(v ? (v as EditorStepId) : undefined)}
      className="flex flex-col gap-3"
    >
      {EDITOR_STEPS.map((step, index) => {
        const next = EDITOR_STEPS[index + 1];
        const state = states[step.id];
        return (
          <AccordionPrimitive.Item
            key={step.id}
            value={step.id}
            id={editorSectionDomId(step.id)}
            className="scroll-mt-4 overflow-hidden rounded-3xl bg-card shadow-sm"
          >
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="group flex w-full items-center gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    state === "complete" && "bg-[oklch(0.9_0.08_160)] text-[oklch(0.35_0.1_160)]",
                    state === "warning" && "bg-destructive/10 text-destructive",
                    state === "empty" && "bg-secondary text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {state === "complete" ? (
                    <Check className="size-4" />
                  ) : state === "warning" ? (
                    <AlertTriangle className="size-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
                    {t(locale, step.labelKey)}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm",
                      state === "warning" ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {summaries[step.id]}
                  </span>
                </span>
                <span className="sr-only">
                  {state === "complete"
                    ? t(locale, "sectionComplete")
                    : state === "warning"
                      ? t(locale, "sectionNeedsAttention")
                      : ""}
                </span>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-accent group-data-[state=open]:bg-accent">
                  <Plus
                    className="size-5 text-foreground transition-transform duration-300 group-data-[state=open]:rotate-45 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
              <div className="flex flex-col gap-6 border-t border-border/50 px-5 pb-6 pt-5 sm:px-6">
                {renderSection(step.id)}
                {next && (
                  <button
                    type="button"
                    onClick={() => onOpenStepChange(next.id)}
                    className="inline-flex min-h-11 items-center gap-2 self-end rounded-xl bg-accent px-4 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    {t(locale, "continue")}: {t(locale, next.labelKey)}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        );
      })}
    </AccordionPrimitive.Root>
  );
}
