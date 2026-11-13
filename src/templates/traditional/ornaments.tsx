/** Keraton gold ornaments for the Traditional template (decorative, aria-hidden). */
import { useId } from "react";

const GOLD = "#c9a45c";
const HIGHLIGHT = "#e8c674";

/** Gunungan (wayang tree-of-life) arch crowned by a diamond. */
export function Gunungan({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      aria-hidden
      fill="none"
      stroke={GOLD}
      strokeWidth={1.2}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path d="M60 6 L66 14 L60 22 L54 14 Z" fill={GOLD} fillOpacity={0.9} />
      <path d="M60 26 C 82 34, 96 52, 98 74 L22 74 C 24 52, 38 34, 60 26 Z" />
      <path d="M60 34 C 76 41, 86 55, 88 68 L32 68 C 34 55, 44 41, 60 34 Z" strokeOpacity={0.7} />
      <path
        d="M60 40 L60 68 M60 50 C 52 50, 48 56, 46 62 M60 50 C 68 50, 72 56, 74 62 M60 58 C 54 58, 52 62, 50 66 M60 58 C 66 58, 68 62, 70 66"
        strokeOpacity={0.8}
      />
      <path d="M4 74 L116 74" />
      <path d="M14 74 L18 70 L22 74 L18 78 Z M98 74 L102 70 L106 74 L102 78 Z" fill={GOLD} />
    </svg>
  );
}

/** Section divider: tapered hairlines, curls, and a centre diamond flanked by dots. */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 20" className={className} aria-hidden fill="none" stroke={GOLD}>
      <path d="M4 10 H62 M118 10 H176" strokeWidth={1} strokeOpacity={0.7} />
      <path d="M62 10 C 70 3, 76 3, 80 10 M118 10 C 110 3, 104 3, 100 10" strokeWidth={1} />
      <path d="M90 1 L99 10 L90 19 L81 10 Z" fill={GOLD} />
      <path d="M90 5 L95 10 L90 15 L85 10 Z" fill={HIGHLIGHT} stroke="none" />
      <circle cx={70} cy={14} r={1.4} fill={GOLD} stroke="none" />
      <circle cx={110} cy={14} r={1.4} fill={GOLD} stroke="none" />
    </svg>
  );
}

/** Older name, kept so existing imports keep working. */
export const DiamondDivider = SectionDivider;

/** Small gunungan crown shown above section titles. */
export function HeadingOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 30" className={className} aria-hidden fill="none" stroke={GOLD}>
      <path d="M32 2 L36 7 L32 12 L28 7 Z" fill={HIGHLIGHT} stroke="none" />
      <path d="M32 14 C 44 18, 50 24, 52 28 H12 C 14 24, 20 18, 32 14 Z" strokeWidth={1.1} />
      <path
        d="M32 18 V28 M32 22 C 27 22, 25 25, 24 28 M32 22 C 37 22, 39 25, 40 28"
        strokeWidth={0.9}
      />
      <path d="M2 28 H62" strokeWidth={0.9} strokeOpacity={0.7} />
    </svg>
  );
}

/** Repeating kawung batik field (48 px tile) that fills its box. */
export function KawungPattern({
  className,
  opacity = 0.16,
}: {
  className?: string;
  opacity?: number;
}) {
  const id = `kawung-${useId().replace(/:/g, "")}`;
  return (
    <svg className={className} width="100%" height="100%" aria-hidden>
      <defs>
        <pattern id={id} width={48} height={48} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={GOLD} strokeOpacity={opacity} strokeWidth={1.1}>
            <ellipse cx={24} cy={12} rx={6.5} ry={11} />
            <ellipse cx={24} cy={36} rx={6.5} ry={11} />
            <ellipse cx={12} cy={24} rx={11} ry={6.5} />
            <ellipse cx={36} cy={24} rx={11} ry={6.5} />
          </g>
          <circle cx={24} cy={24} r={1.7} fill={GOLD} fillOpacity={opacity * 2} />
          <circle cx={0} cy={0} r={1.2} fill={GOLD} fillOpacity={opacity * 1.5} />
          <circle cx={48} cy={48} r={1.2} fill={GOLD} fillOpacity={opacity * 1.5} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Eight-petal rosette inside a double ring; turns slowly behind the cover names. */
export function CoverMedallion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none" stroke={GOLD}>
      <circle cx={50} cy={50} r={47} strokeWidth={0.6} />
      <circle cx={50} cy={50} r={41} strokeWidth={0.5} strokeDasharray="1.5 3" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45} 50 50)`}>
          <ellipse cx={50} cy={23} rx={5.5} ry={13} strokeWidth={0.6} />
          <path d="M50 14 L52 18 L50 22 L48 18 Z" fill={GOLD} fillOpacity={0.6} stroke="none" />
        </g>
      ))}
      <circle cx={50} cy={50} r={8} strokeWidth={0.6} />
    </svg>
  );
}

/** One carved gebyok door leaf: double frame, kawung field, centre flourish. */
export function GebyokPanel({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#3a1d12]">
      <KawungPattern className="absolute inset-0" opacity={0.2} />
      <div className="absolute inset-3 border border-[#c9a45c]/80" />
      <div className="absolute inset-[18px] border border-[#c9a45c]/40" />
      <SideFlourish
        className={`absolute top-1/2 h-72 w-7 -translate-y-1/2 opacity-60 ${left ? "right-6" : "left-6"}`}
      />
      <Gunungan className="absolute left-1/2 top-8 h-16 w-24 -translate-x-1/2 opacity-80" />
      <Gunungan flip className="absolute bottom-8 left-1/2 h-16 w-24 -translate-x-1/2 opacity-80" />
      <div className={`absolute inset-y-0 w-px bg-[#e8c674]/60 ${left ? "right-0" : "left-0"}`} />
    </div>
  );
}

/** Vertical side flourish (low opacity on the cover). */
export function SideFlourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 240"
      className={className}
      aria-hidden
      fill="none"
      stroke={GOLD}
      strokeWidth={1}
    >
      <path d="M12 0 V240" strokeOpacity={0.6} />
      {[40, 120, 200].map((y) => (
        <g key={y}>
          <path d={`M12 ${y - 14} L20 ${y} L12 ${y + 14} L4 ${y} Z`} />
          <path d={`M12 ${y - 6} L15 ${y} L12 ${y + 6} L9 ${y} Z`} fill={GOLD} />
          <path
            d={`M12 ${y - 30} C 20 ${y - 24}, 20 ${y - 18}, 12 ${y - 14} M12 ${y + 30} C 4 ${y + 24}, 4 ${y + 18}, 12 ${y + 14}`}
          />
        </g>
      ))}
    </svg>
  );
}

/** Carved corner frame: double L with a curl and a diamond; rotate per corner. */
export function CornerFrame({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      className={className}
      aria-hidden
      fill="none"
      stroke={GOLD}
      strokeWidth={1.3}
    >
      <path d="M2 34 V2 H34" />
      <path d="M7 27 V7 H27" strokeOpacity={0.6} />
      <path d="M7 16 C 12 16, 16 12, 16 7" strokeOpacity={0.8} />
      <path d="M2 2 L7 2 L7 7 L2 7 Z" fill={GOLD} />
      <path d="M12 12 L14.5 9.5 L17 12 L14.5 14.5 Z" fill={HIGHLIGHT} stroke="none" />
    </svg>
  );
}

/** Four gold corners filling their positioned parent. */
export function Corners() {
  const base = "pointer-events-none absolute h-9 w-9";
  return (
    <>
      <CornerFrame className={`${base} left-2 top-2`} />
      <CornerFrame className={`${base} right-2 top-2 rotate-90`} />
      <CornerFrame className={`${base} bottom-2 right-2 rotate-180`} />
      <CornerFrame className={`${base} bottom-2 left-2 -rotate-90`} />
    </>
  );
}
