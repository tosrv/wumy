import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export const inputClass =
  "h-11 w-full rounded-xl bg-background px-3.5 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function StepShell({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-card p-5 shadow-sm lg:p-7">
      <div className="flex items-center gap-2.5">
        {icon}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
