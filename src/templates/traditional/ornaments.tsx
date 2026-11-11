/** Keraton gold ornaments for the Traditional template (decorative, aria-hidden). */
const GOLD = "#c9a45c";

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

/** Small diamond divider flanked by hairlines. */
export function DiamondDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 16" className={className} aria-hidden fill="none" stroke={GOLD}>
      <path d="M4 8 H56 M84 8 H136" strokeWidth={1} />
      <path d="M70 1 L77 8 L70 15 L63 8 Z" fill={GOLD} />
      <path d="M58 8 L61 5 L64 8 L61 11 Z M76 8 L79 5 L82 8 L79 11 Z" strokeWidth={1} />
    </svg>
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

/** L-shaped gold corner with a dot; rotate per corner. */
export function Corner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={className}
      aria-hidden
      fill="none"
      stroke={GOLD}
      strokeWidth={1.4}
    >
      <path d="M2 26 V2 H26" />
      <path d="M7 20 V7 H20" strokeOpacity={0.6} />
      <circle cx={2} cy={2} r={2} fill={GOLD} />
    </svg>
  );
}

/** Four gold corners filling their positioned parent. */
export function Corners() {
  const base = "pointer-events-none absolute h-7 w-7";
  return (
    <>
      <Corner className={`${base} left-2 top-2`} />
      <Corner className={`${base} right-2 top-2 rotate-90`} />
      <Corner className={`${base} bottom-2 right-2 rotate-180`} />
      <Corner className={`${base} bottom-2 left-2 -rotate-90`} />
    </>
  );
}
