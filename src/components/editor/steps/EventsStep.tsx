import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ArrowDown, ArrowUp, CalendarDays, Plus, Trash2 } from "lucide-react";
import { t, type EditorStringKey } from "@/lib/editor-i18n";
import { newId, type ContentEvent } from "@/lib/invitation-content";
import type { EditorFormValues } from "@/components/editor/editor-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, StepShell, inputClass } from "./StepShell";

const MAX_EVENTS = 6;

const KINDS: { value: ContentEvent["kind"]; labelKey: EditorStringKey }[] = [
  { value: "akad", labelKey: "eventKindAkad" },
  { value: "pemberkatan", labelKey: "eventKindPemberkatan" },
  { value: "resepsi", labelKey: "eventKindResepsi" },
  { value: "ngunduh_mantu", labelKey: "eventKindNgunduhMantu" },
  { value: "other", labelKey: "eventKindOther" },
];

function newEvent(): ContentEvent {
  return {
    id: newId(),
    kind: "resepsi",
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    mapsUrl: "",
  };
}

export function EventsStep() {
  const { control, register } = useFormContext<EditorFormValues>();
  const locale = useWatch({ control, name: "locale" });
  const { fields, append, remove, move } = useFieldArray({ control, name: "events" });
  const atLimit = fields.length >= MAX_EVENTS;

  return (
    <StepShell
      icon={<CalendarDays className="size-5 text-primary" />}
      title={t(locale, "stepEvents")}
    >
      {fields.length === 0 && (
        <p className="rounded-xl bg-secondary/50 px-4 py-8 text-center text-sm text-muted-foreground">
          {t(locale, "noEvents")}
        </p>
      )}

      {fields.map((field, index) => {
        const p = `events.${index}` as const;
        return (
          <section key={field.id} className="flex flex-col gap-4 rounded-xl bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold">
                {index + 1}. {t(locale, "event")}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t(locale, "moveUp")}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t(locale, "moveDown")}
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t(locale, "removeEvent")}
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t(locale, "eventKind")} htmlFor={`${p}-kind`}>
                <select id={`${p}-kind`} className={inputClass} {...register(`${p}.kind`)}>
                  {KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {t(locale, k.labelKey)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t(locale, "eventTitle")} htmlFor={`${p}-title`}>
                <Input id={`${p}-title`} className={inputClass} {...register(`${p}.title`)} />
              </Field>
              <Field label={t(locale, "eventDate")} htmlFor={`${p}-date`}>
                <Input
                  id={`${p}-date`}
                  type="date"
                  className={inputClass}
                  {...register(`${p}.date`)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t(locale, "startTime")} htmlFor={`${p}-start`}>
                  <Input
                    id={`${p}-start`}
                    type="time"
                    className={inputClass}
                    {...register(`${p}.startTime`)}
                  />
                </Field>
                <Field
                  label={t(locale, "endTime")}
                  htmlFor={`${p}-end`}
                  hint={t(locale, "endTimeHint")}
                >
                  <Input
                    id={`${p}-end`}
                    type="time"
                    className={inputClass}
                    {...register(`${p}.endTime`)}
                  />
                </Field>
              </div>
              <Field label={t(locale, "venueName")} htmlFor={`${p}-venue`}>
                <Input id={`${p}-venue`} className={inputClass} {...register(`${p}.venueName`)} />
              </Field>
              <Field label={t(locale, "venueAddress")} htmlFor={`${p}-address`}>
                <Input
                  id={`${p}-address`}
                  className={inputClass}
                  {...register(`${p}.venueAddress`)}
                />
              </Field>
            </div>
            <Field label={t(locale, "mapsUrl")} htmlFor={`${p}-maps`}>
              <Input
                id={`${p}-maps`}
                type="url"
                inputMode="url"
                placeholder="https://maps.google.com/…"
                className={inputClass}
                {...register(`${p}.mapsUrl`)}
              />
            </Field>
          </section>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        disabled={atLimit}
        onClick={() => append(newEvent())}
        className="self-start rounded-xl"
      >
        <Plus className="size-4" />
        {atLimit ? t(locale, "eventLimit") : t(locale, "addEvent")}
      </Button>
    </StepShell>
  );
}
