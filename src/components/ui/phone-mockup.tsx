import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
  /** Screen height; defaults to editor preview size. */
  screenClassName?: string;
}

export function PhoneMockup({
  children,
  className,
  screenClassName,
}: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[390px] shrink-0 rounded-[48px] bg-foreground p-3.5 shadow-2xl",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-[730px] w-full overflow-hidden rounded-[36px] bg-background",
          screenClassName,
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20"
          aria-hidden="true"
        >
          <div className="relative flex h-12 items-center justify-between px-5 pt-1 text-[11px] font-semibold tracking-tight text-foreground">
            <span className="w-14 pl-1">9:41</span>

            <div className="absolute left-1/2 top-2.5 flex h-[27px] w-[108px] -translate-x-1/2 items-center justify-end gap-2 rounded-full bg-foreground px-2.5 shadow-sm">
              <span className="size-1.5 rounded-full bg-neutral-600" />
              <span className="relative size-2.5 rounded-full bg-neutral-800 ring-1 ring-neutral-600">
                <span className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/80" />
              </span>
            </div>

            <div className="flex w-14 items-center justify-end gap-0.5 pr-0.5">
              <Signal className="size-3.5" strokeWidth={2.25} />
              <Wifi className="size-3.5" strokeWidth={2.25} />
              <BatteryFull className="size-4" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="h-full overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
