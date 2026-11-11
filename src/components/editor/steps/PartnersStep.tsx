import { useFormContext, useWatch } from "react-hook-form";
import { Heart } from "lucide-react";
import { t } from "@/lib/editor-i18n";
import type { InvitationPhotoRow } from "@/lib/invitations";
import type { EditorFormValues } from "@/components/editor/editor-form";
import { Input } from "@/components/ui/input";
import { Field, StepShell, inputClass } from "./StepShell";
import { PhotoSlot } from "./PhotoSlot";

interface PartnersStepProps {
  invitationId: string;
  photos: InvitationPhotoRow[];
  onPhotosChange: () => void;
}

const PARTNERS = [
  { key: "a", role: "partner_a", dot: "bg-accent", labelKey: "partnerA" },
  { key: "b", role: "partner_b", dot: "bg-muted-foreground", labelKey: "partnerB" },
] as const;

const FIELDS = [
  { name: "fullName", labelKey: "fullName" },
  { name: "nickname", labelKey: "nickname" },
  { name: "fatherName", labelKey: "fatherName" },
  { name: "motherName", labelKey: "motherName" },
  { name: "childOrder", labelKey: "childOrder", hintKey: "childOrderHint" },
] as const;

export function PartnersStep({ invitationId, photos, onPhotosChange }: PartnersStepProps) {
  const { register, control } = useFormContext<EditorFormValues>();
  const locale = useWatch({ control, name: "locale" });

  return (
    <StepShell
      icon={<Heart className="size-5 fill-current text-primary" />}
      title={t(locale, "stepPartners")}
    >
      {PARTNERS.map((partner) => (
        <fieldset key={partner.key} className="flex flex-col gap-3">
          <legend className="mb-1 flex items-center gap-2">
            <span className={`size-2 rounded-full ${partner.dot}`} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {t(locale, partner.labelKey)}
            </span>
          </legend>
          <PhotoSlot
            invitationId={invitationId}
            role={partner.role}
            photo={photos.find((p) => p.role === partner.role)}
            onChange={onPhotosChange}
            locale={locale}
            label={`${t(locale, "photo")} ${t(locale, partner.labelKey)}`}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELDS.map((f) => {
              const id = `partner-${partner.key}-${f.name}`;
              return (
                <Field
                  key={f.name}
                  label={t(locale, f.labelKey)}
                  htmlFor={id}
                  {...("hintKey" in f ? { hint: t(locale, f.hintKey) } : {})}
                >
                  <Input
                    id={id}
                    className={inputClass}
                    {...register(`partners.${partner.key}.${f.name}`)}
                  />
                </Field>
              );
            })}
          </div>
        </fieldset>
      ))}
    </StepShell>
  );
}
