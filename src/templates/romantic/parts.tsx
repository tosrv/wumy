import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/templates/shared";
import { FloralDivider } from "./ornaments";

/** Romantic palette and type, shared by the section files. */
export const R = {
  bg: "bg-[#f6ede8]",
  ink: "text-[#7a4a40]",
  /** Body-safe muted ink (≥ 4.5:1 on the blush background). */
  muted: "text-[#86594f]",
  kicker: "text-[#8a5d52]",
  card: "rounded-[28px] border border-[#ecd3cb] bg-[#fbf4f1] shadow-[0_10px_30px_-18px_rgba(122,74,64,0.45)]",
  script: "font-[family-name:'Great_Vibes',cursive] font-normal",
  serif: "font-[family-name:'Cormorant_Garamond',Georgia,serif]",
  sans: "font-[family-name:'Inter',system-ui,sans-serif]",
  pill: "inline-flex min-h-11 items-center justify-center rounded-full bg-[#7a4a40] px-7 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#f6ede8] transition hover:bg-[#6a3e35] disabled:opacity-60",
  ghostPill:
    "inline-flex min-h-11 items-center justify-center rounded-full font-[family-name:'Inter',system-ui,sans-serif] border border-[#c99a8f] px-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7a4a40] transition hover:bg-[#f0d5cd]/60",
  /** Background-music toggle: palette colours, icon contrast >= 3:1. */
  music:
    "bg-[#7a4a40] text-[#f6ede8] hover:bg-[#6a3e35] transition-colors motion-reduce:transition-none",
} as const;

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;600&display=swap";

/** Section wrapper: fades and lifts 16 px into view once. */
export function Section({
  children,
  className,
  testId,
}: {
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  const { ref, visible } = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      data-testid={testId}
      className={cn(
        "px-6 py-16 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Small spaced kicker, script title and floral divider. */
export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-10 text-center">
      <p className={cn(R.sans, R.kicker, "text-[11px] font-semibold uppercase tracking-[0.32em]")}>
        {kicker}
      </p>
      <h2 className={cn(R.script, "mt-2 text-[44px] leading-tight")}>{title}</h2>
      <FloralDivider className="mx-auto mt-3 h-6 w-36" />
    </div>
  );
}
