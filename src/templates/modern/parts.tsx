import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/templates/shared";

/** Modern "Grid brutalist" palette and type, shared by the section files. */
export const T = {
  bg: "bg-[#0c0c0c]",
  ink: "text-[#f2f2f0]",
  /** Muted ink for secondary copy (≈ 7.9:1 on the black background). */
  muted: "text-[#a3a3a0]",
  accent: "text-[#d4f932]",
  sans: "font-[family-name:'Space_Grotesk',sans-serif]",
  /** Small spaced caps used for kickers and meta labels. */
  label: "text-[12px] font-semibold uppercase tracking-[0.2em] text-[#a3a3a0]",
  /** Thin divider colour. */
  rule: "border-[#ffffff20]",
  button:
    "inline-flex min-h-11 items-center justify-center gap-2 bg-[#d4f932] px-6 text-[13px] font-bold uppercase tracking-[0.12em] text-[#0c0c0c] transition motion-reduce:transition-none hover:bg-[#f2f2f0] disabled:opacity-60",
  ghost:
    "inline-flex min-h-11 items-center justify-center border border-[#d4f932] px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#d4f932] transition motion-reduce:transition-none hover:bg-[#d4f932] hover:text-[#0c0c0c]",
  /** Background-music toggle: palette colours, icon contrast >= 3:1. */
  music:
    "bg-[#d4f932] text-[#0c0c0c] hover:bg-[#f2f2f0] transition-colors motion-reduce:transition-none",
} as const;

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap";

/** 22 px hairline grid used as the cover backdrop. */
export const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)",
  backgroundSize: "22px 22px",
} as const;

/** Section wrapper: fades and lifts 16 px into view once, with a top divider. */
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
        T.rule,
        "border-t px-5 py-16 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none sm:px-8",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Accent index ("02 —") over a big uppercase heading. */
export function SectionTitle({ index, title }: { index: number; title: string }) {
  return (
    <div className="mb-10">
      <p className={cn(T.accent, "text-[13px] font-semibold tracking-[0.2em] tabular-nums")}>
        {String(index).padStart(2, "0")} —
      </p>
      <h2 className="mt-3 text-[clamp(30px,9vw,44px)] font-bold uppercase leading-[0.95] tracking-[-0.03em] [overflow-wrap:anywhere]">
        {title}
      </h2>
    </div>
  );
}
