import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/templates/shared";

/** Playful "Neo-brutal card" palette and type, shared by the section files. */
export const T = {
  lime: "bg-[#d4f932]",
  pink: "bg-[#ff8fb1]",
  cream: "bg-[#fff7e8]",
  ink: "text-[#1b1b1b]",
  /** Secondary copy: ink at 75 % stays ≥ 7:1 on lime, pink, white and cream. */
  muted: "text-[#1b1b1b]/75",
  display: "font-[family-name:'Syne',sans-serif]",
  sans: "font-[family-name:'Inter',sans-serif]",
  /** White card with ink border and hard offset shadow. */
  card: "rounded-[22px] border-2 border-[#1b1b1b] bg-white shadow-[6px_6px_0_#1b1b1b]",
  /** Small pill sticker (colour added per use). */
  sticker:
    "inline-block rounded-full border-2 border-[#1b1b1b] px-3.5 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1b1b1b]",
  label: "text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1b1b1b]/75",
  /** Pressing shifts the button into its shadow. */
  press:
    "transition-[transform,box-shadow] duration-150 active:translate-x-[2px] active:translate-y-[2px] motion-reduce:transition-none motion-reduce:active:translate-x-0 motion-reduce:active:translate-y-0",
  button:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[#1b1b1b] bg-[#1b1b1b] px-6 text-[15px] font-semibold text-[#d4f932] shadow-[4px_4px_0_#1b1b1b55] active:shadow-[2px_2px_0_#1b1b1b55] disabled:opacity-60",
  ghost:
    "inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#1b1b1b] bg-white px-5 text-[14px] font-semibold text-[#1b1b1b] shadow-[3px_3px_0_#1b1b1b] hover:bg-[#fff7e8] active:shadow-[1px_1px_0_#1b1b1b]",
  /** Background-music toggle: palette colours, icon contrast >= 3:1. */
  music:
    "border-2 border-[#1b1b1b] bg-[#1b1b1b] text-[#d4f932] transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b1b1b]",
} as const;

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;600&display=swap";

/** Section wrapper: fades and lifts 16 px into view once; `band` switches to cream. */
export function Section({
  children,
  className,
  band = false,
  testId,
}: {
  children: ReactNode;
  className?: string;
  band?: boolean;
  testId?: string;
}) {
  const { ref, visible } = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      data-testid={testId}
      className={cn(
        band ? cn(T.cream, "border-y-2 border-[#1b1b1b]") : "",
        "px-5 py-16 sm:px-8",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-[680px] transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Rotated sticker kicker (pink on odd, lime on even sections) over a Syne heading. */
export function SectionTitle({
  index,
  kicker,
  title,
}: {
  index: number;
  kicker: string;
  title: string;
}) {
  const odd = index % 2 === 1;
  return (
    <div className="mb-10">
      <p className={cn(T.sticker, odd ? T.pink : T.lime, odd ? "-rotate-3" : "rotate-2")}>
        {kicker}
      </p>
      <h2
        className={cn(
          T.display,
          "mt-4 text-[clamp(32px,9vw,46px)] font-extrabold leading-[1] tracking-[-0.02em] [overflow-wrap:anywhere]",
        )}
      >
        {title}
      </h2>
    </div>
  );
}
