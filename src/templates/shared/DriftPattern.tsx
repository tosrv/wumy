import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative background layer that drifts its pattern diagonally by one 48 px tile
 * (`animate-wumy-drift`), so a 48 px pattern loops seamlessly. Static under reduced motion.
 */
export function DriftPattern({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="animate-wumy-drift absolute -inset-12">{children}</div>
    </div>
  );
}
