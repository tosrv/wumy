import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/templates/shared";
import { DiamondDivider } from "./ornaments";

/** Traditional palette and type, shared by the section files. */
export const T = {
  bg: "bg-[#2b1d14]",
  ink: "text-[#f3e6c8]",
  gold: "text-[#c9a45c]",
  /** Muted ink for secondary body copy (≈ 10:1 on the dark background). */
  muted: "text-[#d8c7a2]",
  card: "relative border border-[#c9a45c]/70 bg-[#33241a] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]",
  display: "font-[family-name:'Cinzel',Georgia,serif]",
  serif: "font-[family-name:'Cormorant_Garamond',Georgia,serif]",
  label: "text-[11px] font-semibold uppercase tracking-[0.34em] text-[#c9a45c]",
  button:
    "inline-flex min-h-11 items-center justify-center bg-[#c9a45c] px-7 font-[family-name:'Cinzel',Georgia,serif] text-[13px] font-semibold uppercase tracking-[0.2em] text-[#2b1d14] transition hover:bg-[#d8b56d] disabled:opacity-60",
  ghost:
    "inline-flex min-h-11 items-center justify-center border border-[#c9a45c] px-5 font-[family-name:'Cinzel',Georgia,serif] text-[12px] font-semibold uppercase tracking-[0.16em] text-[#c9a45c] transition hover:bg-[#c9a45c]/10",
  /** Background-music toggle: palette colours, icon contrast >= 3:1. */
  music:
    "bg-[#c9a45c] text-[#2b1d14] hover:bg-[#d8b56d] transition-colors motion-reduce:transition-none",
} as const;

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap";

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

/** Spaced kicker, Cinzel gold title and diamond divider. */
export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-10 text-center">
      <p className={cn(T.serif, T.muted, "text-[15px] italic")}>{kicker}</p>
      <h2
        className={cn(
          T.display,
          T.gold,
          "mt-2 text-[24px] font-semibold uppercase leading-tight tracking-[0.16em]",
        )}
      >
        {title}
      </h2>
      <DiamondDivider className="mx-auto mt-4 h-4 w-36" />
    </div>
  );
}
