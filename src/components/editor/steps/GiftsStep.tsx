import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Gift as GiftIcon, Plus, Trash2 } from "lucide-react";
import { t, type EditorStringKey } from "@/lib/editor-i18n";
import { MAX_ITEMS, newId, type Gift } from "@/lib/invitation-content";
import type { EditorFormValues } from "@/components/editor/editor-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, StepShell, inputClass } from "./StepShell";

const PROVIDERS: { value: Extract<Gift, { kind: "ewallet" }>["provider"]; label?: string }[] = [
  { value: "dana", label: "DANA" },
  { value: "ovo", label: "OVO" },
  { value: "gopay", label: "GoPay" },
  { value: "shopeepay", label: "ShopeePay" },
  { value: "other" },
];

const KIND_LABEL: Record<Gift["kind"], EditorStringKey> = {
  bank: "giftBank",
  ewallet: "giftEwallet",
  address: "giftAddress",
};

function newGift(kind: Gift["kind"]): Gift {
  if (kind === "bank")
    return { id: newId(), kind, bankName: "", accountName: "", accountNumber: "" };
  if (kind === "ewallet") {
    return { id: newId(), kind, provider: "dana", accountName: "", accountNumber: "" };
  }
  return { id: newId(), kind, recipient: "", address: "" };
}

export function GiftsStep() {
  const { control, register } = useFormContext<EditorFormValues>();
  const locale = useWatch({ control, name: "locale" });
  const gifts = useWatch({ control, name: "gifts" });
  const { fields, append, remove } = useFieldArray({ control, name: "gifts" });
  const atLimit = fields.length >= MAX_ITEMS;

  return (
    <StepShell icon={<GiftIcon className="size-5 text-primary" />} title={t(locale, "stepGifts")}>
      {fields.length === 0 && (
        <p className="rounded-xl bg-secondary/50 px-4 py-8 text-center text-sm text-muted-foreground">
          {t(locale, "giftsEmpty")}
        </p>
      )}

      {fields.map((field, index) => {
        const p = `gifts.${index}` as const;
        const kind = gifts[index]?.kind ?? field.kind;
        return (
          <section key={field.id} className="flex flex-col gap-4 rounded-xl bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold">
                {index + 1}. {t(locale, KIND_LABEL[kind])}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t(locale, "removeGift")}
                className="text-destructive hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {kind === "address" ? (
              <div className="grid grid-cols-1 gap-3">
                <Field label={t(locale, "recipient")} htmlFor={`${p}-recipient`}>
                  <Input
                    id={`${p}-recipient`}
                    className={inputClass}
                    {...register(`${p}.recipient`)}
                  />
                </Field>
                <Field label={t(locale, "address")} htmlFor={`${p}-address`}>
                  <textarea
                    id={`${p}-address`}
                    rows={3}
                    className="w-full resize-y rounded-xl bg-background px-3.5 py-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    {...register(`${p}.address`)}
                  />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {kind === "bank" ? (
                  <Field label={t(locale, "bankName")} htmlFor={`${p}-bank`}>
                    <Input
                      id={`${p}-bank`}
                      placeholder="BCA"
                      className={inputClass}
                      {...register(`${p}.bankName`)}
                    />
                  </Field>
                ) : (
                  <Field label={t(locale, "ewalletProvider")} htmlFor={`${p}-provider`}>
                    <select
                      id={`${p}-provider`}
                      className={inputClass}
                      {...register(`${p}.provider`)}
                    >
                      {PROVIDERS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label ?? t(locale, "ewalletOther")}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label={t(locale, "accountName")} htmlFor={`${p}-name`}>
                  <Input
                    id={`${p}-name`}
                    className={inputClass}
                    {...register(`${p}.accountName`)}
                  />
                </Field>
                <Field label={t(locale, "accountNumber")} htmlFor={`${p}-number`}>
                  <Input
                    id={`${p}-number`}
                    inputMode="numeric"
                    className={inputClass}
                    {...register(`${p}.accountNumber`)}
                  />
                </Field>
              </div>
            )}
          </section>
        );
      })}

      {atLimit ? (
        <p className="text-xs font-semibold text-muted-foreground">{t(locale, "giftLimit")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["bank", "addBank"],
              ["ewallet", "addEwallet"],
              ["address", "addAddress"],
            ] as const
          ).map(([kind, labelKey]) => (
            <Button
              key={kind}
              type="button"
              variant="secondary"
              onClick={() => append(newGift(kind))}
              className="rounded-xl"
            >
              <Plus className="size-4" />
              {t(locale, labelKey)}
            </Button>
          ))}
        </div>
      )}
    </StepShell>
  );
}
