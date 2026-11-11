import { useFormContext, useWatch } from "react-hook-form";
import { AlertCircle, CheckCircle2, ClipboardCheck } from "lucide-react";
import { getPublicHost } from "@/lib/urls";
import { t } from "@/lib/editor-i18n";
import type { EditorFormValues } from "@/components/editor/editor-form";
import type { PublishIssue } from "@/components/editor/publish-issues";
import { EDITOR_STEPS, type EditorStepId } from "@/components/editor/sections/EditorStepHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, StepShell } from "./StepShell";

interface ReviewStepProps {
  issues: PublishIssue[];
  onGoToStep: (step: EditorStepId) => void;
  onPublish: () => void;
  publishing: boolean;
  /** Extra conditions besides issues, e.g. a template is picked and nothing is saving. */
  canPublish: boolean;
  /** Why the slug was not saved (other fields still were). */
  slugError?: string | null;
  /** The invitation has been published: its address can no longer change. */
  slugLocked?: boolean;
}

export function ReviewStep({
  issues,
  onGoToStep,
  onPublish,
  publishing,
  canPublish,
  slugError,
  slugLocked = false,
}: ReviewStepProps) {
  const { control, setValue } = useFormContext<EditorFormValues>();
  const locale = useWatch({ control, name: "locale" });
  const slug = useWatch({ control, name: "slug" });

  return (
    <StepShell
      icon={<ClipboardCheck className="size-5 text-primary" />}
      title={t(locale, "stepReview")}
    >
      <Field label={t(locale, "invitationUrl")} htmlFor="invitation-slug">
        <div className="flex h-11 items-center overflow-hidden rounded-xl bg-background shadow-sm focus-within:ring-2 focus-within:ring-accent">
          <span className="shrink-0 pl-3.5 text-xs font-semibold text-muted-foreground">
            {getPublicHost()}/
          </span>
          <Input
            id="invitation-slug"
            value={slug}
            readOnly={slugLocked}
            onChange={(e) =>
              setValue(
                "slug",
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "-")
                  .replace(/--+/g, "-"),
                { shouldDirty: true },
              )
            }
            aria-invalid={slugError ? true : undefined}
            aria-describedby={
              slugError
                ? "invitation-slug-error"
                : slugLocked
                  ? "invitation-slug-locked"
                  : undefined
            }
            className="h-11 flex-1 rounded-none border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-0"
          />
        </div>
        {slugLocked && !slugError && (
          <p id="invitation-slug-locked" className="mt-1.5 text-xs text-muted-foreground">
            {t(locale, "slugLocked")}
          </p>
        )}
        {slugError && (
          <p id="invitation-slug-error" className="mt-1.5 text-xs text-destructive">
            {slugError}
          </p>
        )}
      </Field>

      {issues.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-medium">
          <CheckCircle2 className="size-4 text-primary" />
          {t(locale, "reviewReady")}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold">{t(locale, "reviewIssues")}</p>
          <ul className="flex flex-col gap-2">
            {issues.map((issue) => {
              const stepIndex = EDITOR_STEPS.findIndex((s) => s.id === issue.step);
              const step = EDITOR_STEPS[stepIndex]!;
              return (
                <li
                  key={`${issue.step}-${issue.key}-${issue.index ?? ""}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-destructive/10 px-4 py-3"
                >
                  <span className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>
                      <span className="font-semibold">
                        {t(locale, step.labelKey)}
                        {issue.index !== undefined ? ` #${issue.index}` : ""}:
                      </span>{" "}
                      {t(locale, issue.key)}
                    </span>
                  </span>
                  {issue.step !== "review" && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="shrink-0 rounded-xl"
                      onClick={() => onGoToStep(issue.step)}
                    >
                      {t(locale, "goToStep")}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Button
        type="button"
        disabled={issues.length > 0 || !canPublish}
        onClick={onPublish}
        className="h-11 self-start rounded-xl bg-primary font-bold text-primary-foreground"
      >
        {publishing ? t(locale, "publishing") : t(locale, "publish")}
      </Button>
    </StepShell>
  );
}
