/** Line-art floral ornaments for the Romantic template (decorative, aria-hidden). */
const STROKE = "#c99a8f";
const PETAL = "#e8c4bb";
const PETAL_LIGHT = "#f0d5cd";
const SAGE = "#9fb39a";

/** Five-petal blossom centred at (x, y). */
function Blossom({ x, y, r, light = false }: { x: number; y: number; r: number; light?: boolean }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${x} ${y})`}>
      {petals.map((deg) => (
        <ellipse
          key={deg}
          cx={0}
          cy={-r * 0.62}
          rx={r * 0.46}
          ry={r * 0.62}
          transform={`rotate(${deg})`}
          fill={light ? PETAL_LIGHT : PETAL}
          stroke={STROKE}
          strokeWidth={0.8}
        />
      ))}
      <circle r={r * 0.28} fill="#fbf3ef" stroke={STROKE} strokeWidth={0.8} />
    </g>
  );
}

/** Leaf pointing along `angle` degrees from its base at (x, y). */
function Leaf({ x, y, angle, size = 14 }: { x: number; y: number; angle: number; size?: number }) {
  const s = size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path
        d={`M0 0 C ${s * 0.35} ${-s * 0.32}, ${s * 0.8} ${-s * 0.3}, ${s} 0 C ${s * 0.8} ${s * 0.3}, ${s * 0.35} ${s * 0.32}, 0 0 Z`}
        fill={SAGE}
        fillOpacity={0.55}
        stroke={SAGE}
        strokeWidth={0.9}
      />
      <path d={`M0 0 L ${s * 0.85} 0`} stroke="#7f9579" strokeWidth={0.6} />
    </g>
  );
}

/** Small bud: a teardrop on a short stem. */
function Bud({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d="M0 0 L0 -7" stroke={STROKE} strokeWidth={0.9} />
      <path
        d="M0 -6 C -3.5 -9, -3 -14, 0 -16 C 3 -14, 3.5 -9, 0 -6 Z"
        fill={PETAL_LIGHT}
        stroke={STROKE}
        strokeWidth={0.8}
      />
    </g>
  );
}

/** Wide garland of curved stems, blossoms and sage leaves. `flip` mirrors it for the bottom edge. */
export function FloralGarland({ flip = false, className }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 360 130"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scale(-1, -1)" } : undefined}
      preserveAspectRatio="xMidYMin meet"
    >
      <g fill="none" stroke={STROKE} strokeWidth={1.1} strokeLinecap="round">
        <path d="M-6 18 C 50 70, 110 86, 180 60 C 250 86, 310 70, 366 18" />
        <path d="M-6 44 C 40 76, 80 100, 130 96" />
        <path d="M366 44 C 320 76, 280 100, 230 96" />
        <path d="M150 64 C 160 40, 170 30, 180 26 C 190 30, 200 40, 210 64" />
      </g>
      <Leaf x={40} y={52} angle={-28} size={18} />
      <Leaf x={66} y={70} angle={150} size={16} />
      <Leaf x={100} y={82} angle={-12} size={18} />
      <Leaf x={300} y={52} angle={208} size={18} />
      <Leaf x={294} y={70} angle={30} size={16} />
      <Leaf x={260} y={82} angle={192} size={18} />
      <Leaf x={150} y={66} angle={200} size={15} />
      <Leaf x={210} y={66} angle={-20} size={15} />
      <Leaf x={92} y={95} angle={170} size={13} />
      <Leaf x={268} y={95} angle={10} size={13} />
      <Bud x={128} y={78} angle={-20} />
      <Bud x={232} y={78} angle={20} />
      <Bud x={22} y={32} angle={-40} />
      <Bud x={338} y={32} angle={40} />
      <Blossom x={180} y={50} r={17} />
      <Blossom x={150} y={78} r={10} light />
      <Blossom x={210} y={78} r={10} light />
      <Blossom x={80} y={74} r={13} light />
      <Blossom x={280} y={74} r={13} light />
      <Blossom x={130} y={96} r={7} />
      <Blossom x={230} y={96} r={7} />
      <Blossom x={30} y={40} r={9} />
      <Blossom x={330} y={40} r={9} />
    </svg>
  );
}

/** Thin divider with a centred blossom flanked by leaves. */
export function FloralDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 28" aria-hidden="true" className={className}>
      <g stroke={STROKE} strokeWidth={0.9} fill="none" strokeLinecap="round">
        <path d="M6 14 C 30 10, 50 18, 64 14" />
        <path d="M96 14 C 110 10, 130 18, 154 14" />
      </g>
      <Leaf x={64} y={14} angle={200} size={11} />
      <Leaf x={96} y={14} angle={-20} size={11} />
      <Blossom x={80} y={14} r={8} />
      <circle cx={6} cy={14} r={1.6} fill={PETAL} />
      <circle cx={154} cy={14} r={1.6} fill={PETAL} />
    </svg>
  );
}

/** Ring of line-art foliage drawn around a round photo; place it absolutely over the photo box. */
export function FloralRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <circle cx={100} cy={100} r={92} fill="none" stroke={STROKE} strokeWidth={0.9} />
      <circle
        cx={100}
        cy={100}
        r={86}
        fill="none"
        stroke={PETAL}
        strokeWidth={0.6}
        strokeDasharray="2 4"
      />
      <path d="M30 150 C 22 120, 24 88, 40 62" fill="none" stroke={STROKE} strokeWidth={1} />
      <path d="M170 50 C 178 80, 176 112, 160 138" fill="none" stroke={STROKE} strokeWidth={1} />
      <Leaf x={28} y={128} angle={200} size={16} />
      <Leaf x={30} y={100} angle={160} size={15} />
      <Leaf x={36} y={78} angle={210} size={14} />
      <Leaf x={172} y={72} angle={20} size={16} />
      <Leaf x={170} y={100} angle={-20} size={15} />
      <Leaf x={164} y={122} angle={30} size={14} />
      <Blossom x={34} y={152} r={12} />
      <Blossom x={50} y={166} r={7} light />
      <Blossom x={166} y={48} r={12} />
      <Blossom x={150} y={34} r={7} light />
      <Bud x={42} y={60} angle={20} />
      <Bud x={158} y={140} angle={200} />
    </svg>
  );
}
