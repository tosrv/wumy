import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/templates/shared";

/** Minimal "Gallery frame" palette and type, shared by the section files. */
export const T = {
  bg: "bg-[#fafaf7]",
  ink: "text-[#111111]",
  /** Muted ink for secondary copy (≈ 5.7:1 on the off-white background). */
  muted: "text-[#666666]",
  sans: "font-[family-name:'Inter',sans-serif]",
  /** Small spaced caps used for kickers and meta labels. */
  label: "text-[11px] font-semibold uppercase tracking-[0.32em] text-[#666666]",
  /** Hairline rule colour. */
  rule: "border-[#111111]/15",
  button:
    "inline-flex min-h-11 items-center justify-center bg-[#111111] px-7 font-[family-name:'Inter',sans-serif] text-[12px] font-semibold uppercase tracking-[0.24em] text-[#fafaf7] transition hover:bg-[#333333] disabled:opacity-60",
  ghost:
    "inline-flex min-h-11 items-center justify-center border border-[#111111] px-5 font-[family-name:'Inter',sans-serif] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#111111] transition hover:bg-[#111111] hover:text-[#fafaf7]",
  /** Background-music toggle: palette colours, icon contrast >= 3:1. */
  music:
    "bg-[#111111] text-[#fafaf7] hover:bg-[#333333] transition-colors motion-reduce:transition-none",
} as const;

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap";

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
        "px-6 py-20 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Spaced-caps kicker, large light heading and a short hairline. */
export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-12">
      <p className={T.label}>{kicker}</p>
      <h2 className="mt-4 text-[34px] font-light leading-[1.1] tracking-[-0.01em]">{title}</h2>
      <div className="mt-6 h-px w-12 bg-[#111111]" />
    </div>
  );
}
