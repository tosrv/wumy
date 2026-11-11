import { useEffect, useState } from "react";
import { countdownParts } from "./countdown";

/** Live countdown to an ISO date/time; null when no valid target (or before mount). */
export function useCountdown(iso?: string): ReturnType<typeof countdownParts> | null {
  const [parts, setParts] = useState<ReturnType<typeof countdownParts> | null>(null);

  useEffect(() => {
    const target = iso ? new Date(iso).getTime() : NaN;
    if (Number.isNaN(target)) {
      setParts(null);
      return;
    }
    const first = countdownParts(target, Date.now());
    setParts(first);
    if (first.done) return;
    const id = setInterval(() => {
      const next = countdownParts(target, Date.now());
      setParts(next);
      if (next.done) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [iso]);

  return parts;
}
