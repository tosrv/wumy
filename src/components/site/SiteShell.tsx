import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/sections/SiteHeader";
import { SiteFooter } from "@/components/site/sections/SiteFooter";

/** Marketing chrome — header + footer around child routes. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-surface-canvas">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
