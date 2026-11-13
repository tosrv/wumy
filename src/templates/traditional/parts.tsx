import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { staggerDelayMs, useReveal } from "@/templates/shared";
import { HeadingOrnament, SectionDivider } from "./ornaments";

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
  /** Script face for the couple's names on the cover and opening. */
  script: "font-[family-name:'Great_Vibes','Brush_Script_MT',cursive] font-normal normal-case",
  /** Warm gold gradient for primary buttons. */
  goldButton: "bg-[linear-gradient(#e9c977,#b98c3a)] text-[#2b1d14] hover:brightness-110",
  label: "text-[11px] font-semibold uppercase tracking-[0.34em] text-[#c9a45c]",
  button:
    "inline-flex min-h-11 items-center justify-center bg-[linear-gradient(#e9c977,#b98c3a)] px-7 font-[family-name:'Cinzel',Georgia,serif] text-[13px] font-semibold uppercase tracking-[0.2em] text-[#2b1d14] shadow-[0_8px_24px_-12px_rgba(233,201,119,0.7)] transition hover:brightness-110 disabled:opacity-60",
  ghost:
    "inline-flex min-h-11 items-center justify-center border border-[#c9a45c] px-5 font-[family-name:'Cinzel',Georgia,serif] text-[12px] font-semibold uppercase tracking-[0.16em] text-[#c9a45c] transition hover:bg-[#c9a45c]/10",
  /** Background-music toggle: palette colours, icon contrast >= 3:1. */
  music:
    "bg-[#c9a45c] text-[#2b1d14] hover:bg-[#d8b56d] transition-colors motion-reduce:transition-none",
} as const;

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&display=swap";

const REVEAL = "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none";

/**
 * Section wrapper: fades and lifts 16 px into view once. With `stagger`, each direct
 * child does that in turn (120 ms apart) instead of the section as a whole.
 */
export function Section({
  children,
  className,
  testId,
  stagger = false,
}: {
  children: ReactNode;
  className?: string;
  testId?: string;
  stagger?: boolean;
}) {
  const { ref, visible } = useReveal<HTMLElement>();
  const shown = visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0";
  return (
    <section
      ref={ref}
      data-testid={testId}
      className={cn("px-6 py-16", !stagger && [REVEAL, shown], className)}
    >
      {stagger
        ? Children.toArray(children).map((child, i) => (
            <div
              key={i}
              className={cn(REVEAL, shown)}
              style={{ transitionDelay: visible ? `${staggerDelayMs(i)}ms` : "0ms" }}
            >
              {child}
            </div>
          ))
        : children}
    </section>
  );
}

/** Spaced kicker, Cinzel gold title and diamond divider. */
export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-10 text-center">
      <HeadingOrnament className="mx-auto mb-3 h-7 w-16" />
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
      <SectionDivider className="mx-auto mt-4 h-5 w-44" />
    </div>
  );
}
