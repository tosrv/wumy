import { Check, X } from "lucide-react";

import { PASSWORD_RULES } from "@/lib/password";
import { cn } from "@/lib/utils";

type PasswordRequirementsProps = {
  password: string;
  lang?: "id" | "en";
  className?: string;
};

/** Live checklist of the strong-password rules for a new-password field. */
export function PasswordRequirements({
  password,
  lang = "id",
  className,
}: PasswordRequirementsProps) {
  return (
    <ul
      className={cn("grid gap-1 text-xs sm:grid-cols-2", className)}
      aria-label={lang === "id" ? "Syarat kata sandi" : "Password requirements"}
    >
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              met ? "text-emerald-700" : "text-muted-foreground",
            )}
          >
            {met ? (
              <Check className="size-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <X className="size-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>{rule.label[lang]}</span>
            <span className="sr-only">
              {met
                ? lang === "id"
                  ? "(terpenuhi)"
                  : "(met)"
                : lang === "id"
                  ? "(belum)"
                  : "(not met)"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
