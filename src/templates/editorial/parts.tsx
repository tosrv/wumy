import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/templates/shared";

/** Editorial "Magazine cover" palette and type, shared by the section files. */
export const T = {
  bg: "bg-[#f5f1ea]",
  ink: "text-[#1a1a1a]",
  /** Muted ink for secondary copy (≈ 6.3:1 on the paper). */
  muted: "text-[#5c564e]",
  stone: "bg-[#d8cfc2]",
  serif: "font-[family-name:'Playfair_Display',serif]",
  sans: "font-[family-name:'Inter',sans-serif]",
  /** Small spaced caps used for kickers, mastheads and captions. */
  label:
    "font-[family-name:'Inter',sans-serif] text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5c564e]",
  /** Hairline rule colour. */
  rule: "border-[#1a1a1a]/20",
  button:
    "inline-flex min-h-11 items-center justify-center bg-[#1a1a1a] px-7 font-[family-name:'Inter',sans-serif] text-[12px] font-semibold uppercase tracking-[0.24em] text-[#f5f1ea] transition hover:bg-[#3a3a3a] disabled:opacity-60 motion-reduce:transition-none",
  ghost:
    "inline-flex min-h-11 items-center justify-center border border-[#1a1a1a] px-5 font-[family-name:'Inter',sans-serif] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-[#f5f1ea] motion-reduce:transition-none",
  /** Background-music toggle: palette colours, icon contrast >= 3:1. */
  music:
    "bg-[#1a1a1a] text-[#f5f1ea] hover:bg-[#3a3a3a] transition-colors motion-reduce:transition-none",
} as const;

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600&display=swap";

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
        "px-6 py-16 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none md:px-10",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Magazine kicker ("No. 02 — The Couple"), Playfair heading, hairline rule. */
export function SectionTitle({ no, kicker, title }: { no: number; kicker: string; title: string }) {
  return (
    <header className="mb-10">
      <div className={cn(T.rule, "flex items-baseline gap-3 border-t pt-3")}>
        <span className={T.label}>No. {String(no).padStart(2, "0")}</span>
        <span className={T.label} aria-hidden>
          —
        </span>
        <span className={T.label}>{kicker}</span>
      </div>
      <h2 className={cn(T.serif, "mt-5 text-[36px] font-bold leading-[1.05] tracking-[-0.02em]")}>
        {title}
      </h2>
    </header>
  );
}

/** Names with an italic "&"; the "&" is read as a word by screen readers. */
export function Names({ a, b, and }: { a: string; b: string; and: string }) {
  return (
    <>
      <span>{a}</span>{" "}
      <span aria-hidden className="font-normal italic">
        &amp;
      </span>
      <span className="sr-only">{and}</span> <span>{b}</span>
    </>
  );
}
