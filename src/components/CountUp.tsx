import { useEffect, useState } from "react";

type Props = {
  to: number;
  active: boolean;
  durationMs?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
};

/** Animates from 0 → `to` when `active` becomes true. */
export function CountUp({
  to,
  active,
  durationMs = 1800,
  decimals = 0,
  suffix = "",
  className,
}: Props) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(to);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const factor = 10 ** decimals;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(to * eased * factor) / factor);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to, durationMs, decimals]);

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));

  return (
    <span className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
