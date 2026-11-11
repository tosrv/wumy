import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, Link2, Palette, QrCode, SlidersHorizontal } from "lucide-react";
import { daysUntilWedding, type InvitationRow } from "@/lib/invitations";
import { invitationPublicDisplay, invitationPublicUrl } from "@/lib/urls";
import { invitationStatusLabel } from "@/components/dashboard/sections/invitationStatus";
import { cn } from "@/lib/utils";

interface OverviewStatusBarProps {
  invitation: InvitationRow;
}

export function OverviewStatusBar({ invitation }: OverviewStatusBarProps) {
  const [copied, setCopied] = useState(false);
  const days = daysUntilWedding(invitation.wedding_date);
  const publicDisplay = invitationPublicDisplay(invitation.slug);
  const isPublished = invitation.status === "published";

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(invitationPublicUrl(invitation.slug));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-card p-6 shadow-sm">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                isPublished ? "bg-[#ECFDF5] text-[#065F46]" : "bg-secondary text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  isPublished ? "animate-pulse bg-[#10B981]" : "bg-muted-foreground",
                )}
              />
              {invitationStatusLabel(invitation)}
            </span>
            {days != null && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {days >= 0 ? `${days} Days to go` : `${Math.abs(days)} Days ago`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-1.5">
            <Link2 className="size-4 text-foreground/70" />
            <code className="select-all text-xs font-semibold tracking-normal">
              {publicDisplay}
            </code>
            <button
              type="button"
              onClick={() => void copyUrl()}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Copy public link"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
            <button
              type="button"
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Show QR Code"
            >
              <QrCode className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link
            to="/editor/$invitationId"
            params={{ invitationId: invitation.id }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Palette className="size-4" />
            Theme Polish
          </Link>
          <Link
            to="/dashboard/settings"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <SlidersHorizontal className="size-4" />
            Access & Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
