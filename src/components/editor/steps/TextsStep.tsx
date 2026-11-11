import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Quote } from "lucide-react";
import { t, type EditorStringKey } from "@/lib/editor-i18n";
import { religionSchema, type Religion } from "@/lib/invitation-content";
import { applyPreset, getPreset, textsDifferFromPreset } from "@/lib/invitation-presets";
import { contentFromValues, type EditorFormValues } from "@/components/editor/editor-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { MusicCard } from "./MusicCard";
import { Field, StepShell, inputClass } from "./StepShell";

const RELIGIONS: { value: Religion; labelKey: EditorStringKey }[] = [
  { value: "islam", labelKey: "religionIslam" },
  { value: "kristen", labelKey: "religionKristen" },
  { value: "katolik", labelKey: "religionKatolik" },
  { value: "hindu", labelKey: "religionHindu" },
  { value: "buddha", labelKey: "religionBuddha" },
  { value: "umum", labelKey: "religionUmum" },
];

const textareaClass =
  "w-full resize-y rounded-xl bg-background px-3.5 py-3 text-sm leading-relaxed shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function TextsStep({
  invitationId,
  onMusicReplaced,
}: {
  invitationId: string;
  onMusicReplaced: (oldPath: string) => void;
}) {
  const { control, register, getValues, setValue } = useFormContext<EditorFormValues>();
  const locale = useWatch({ control, name: "locale" });
  const religion = useWatch({ control, name: "religion" });
  const [pendingReligion, setPendingReligion] = useState<Religion | null>(null);

  function applyReligion(next: Religion, overwriteTexts: boolean) {
    const current = contentFromValues(getValues());
    const updated = applyPreset({ ...current, religion: next }, getPreset(next, current.locale), {
      overwriteTexts,
    });
    const opts = { shouldDirty: true } as const;
    setValue("religion", next, opts);
    setValue("events", updated.events, opts);
    setValue("quote", updated.quote, opts);
    setValue("quoteSource", updated.quoteSource, opts);
    setValue("greeting", updated.greeting, opts);
    setValue("closing", updated.closing, opts);
  }

  function handleReligionChange(next: Religion) {
    if (next === getValues("religion")) return;
    if (textsDifferFromPreset(contentFromValues(getValues()))) setPendingReligion(next);
    else applyReligion(next, true);
  }

  return (
    <StepShell icon={<Quote className="size-5 text-primary" />} title={t(locale, "stepTexts")}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t(locale, "language")} htmlFor="texts-locale">
          <select id="texts-locale" className={inputClass} {...register("locale")}>
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </Field>
        <Field label={t(locale, "religion")} htmlFor="texts-religion">
          <select
            id="texts-religion"
            className={inputClass}
            value={religion}
            onChange={(e) => handleReligionChange(religionSchema.parse(e.target.value))}
          >
            {RELIGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {t(locale, r.labelKey)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t(locale, "quote")} htmlFor="texts-quote">
        <textarea id="texts-quote" rows={4} className={textareaClass} {...register("quote")} />
      </Field>
      <Field label={t(locale, "quoteSource")} htmlFor="texts-quote-source">
        <Input id="texts-quote-source" className={inputClass} {...register("quoteSource")} />
      </Field>
      <Field label={t(locale, "greeting")} htmlFor="texts-greeting">
        <textarea
          id="texts-greeting"
          rows={4}
          className={textareaClass}
          {...register("greeting")}
        />
      </Field>
      <Field label={t(locale, "closing")} htmlFor="texts-closing">
        <textarea id="texts-closing" rows={4} className={textareaClass} {...register("closing")} />
      </Field>

      <MusicCard invitationId={invitationId} onMusicReplaced={onMusicReplaced} />

      <AlertDialog
        open={pendingReligion !== null}
        onOpenChange={(open) => {
          if (!open) setPendingReligion(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(locale, "replaceTextsTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t(locale, "replaceTextsBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (pendingReligion) applyReligion(pendingReligion, false);
              }}
            >
              {t(locale, "keepTexts")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingReligion) applyReligion(pendingReligion, true);
              }}
            >
              {t(locale, "replaceTexts")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StepShell>
  );
}
