import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { invitationPublicDisplay, invitationPublicUrl } from "@/lib/urls";

interface EditorShellProps {
  coupleLabel: string;
  status: string;
  slug: string;
  saving?: boolean;
  canPublish?: boolean;
  onSave: () => void;
  onPublish?: () => void;
  children: ReactNode;
}

export function EditorShell({
  coupleLabel,
  status,
  slug,
  saving,
  canPublish = false,
  onSave,
  onPublish,
  children,
}: EditorShellProps) {
  const [copied, setCopied] = useState(false);
  const publicDisplay = invitationPublicDisplay(slug || "…");

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(
        slug ? invitationPublicUrl(slug) : `https://${publicDisplay}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/dashboard"
              className="shrink-0 font-display text-lg font-bold tracking-tight"
            >
              WUMY
            </Link>
            <div className="hidden h-5 w-px shrink-0 bg-border sm:block" />
            <Link
              to="/dashboard"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div className="hidden min-w-0 items-center gap-1 truncate text-sm text-muted-foreground md:flex">
              <span className="opacity-50">/</span>
              <span>Invitation</span>
              <span className="opacity-50">/</span>
              <span className="truncate font-semibold text-foreground">
                {coupleLabel}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide lg:inline-flex",
                status === "published"
                  ? "bg-[oklch(0.9_0.08_160)] text-[oklch(0.35_0.1_160)]"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  status === "published"
                    ? "bg-[oklch(0.45_0.1_160)]"
                    : "bg-muted-foreground",
                )}
              />
              {status}
            </span>

            <button
              type="button"
              onClick={() => void copyUrl()}
              className="hidden items-center gap-1.5 rounded-lg bg-secondary/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
              title="Copy preview URL"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span className="max-w-[140px] truncate">{publicDisplay}</span>
            </button>

            <Button
              type="button"
              variant="outline"
              className="hidden h-9 rounded-xl bg-card shadow-sm sm:inline-flex"
              disabled={saving}
              onClick={onSave}
            >
              {saving ? "Saving…" : "Save Draft"}
            </Button>

            <Button
              type="button"
              className={cn(
                "h-9 rounded-xl font-bold shadow-sm",
                canPublish
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "cursor-not-allowed bg-secondary text-muted-foreground opacity-60",
              )}
              disabled={!canPublish}
              onClick={onPublish}
            >
              <Sparkles className="size-4" />
              <span className="hidden sm:inline">Publish Invitation</span>
              <span className="sm:hidden">Publish</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
