import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type RsvpRow = Database["public"]["Tables"]["rsvps"]["Row"];

interface OverviewRsvpFeedProps {
  rsvps: RsvpRow[];
  totalLabel: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function statusBadge(status: RsvpRow["status"], partySize: number) {
  if (status === "coming") {
    return {
      label: `Attending (${partySize})`,
      className: "bg-[#ECFDF5] text-[#065F46]",
      dot: "bg-[#10B981]",
    };
  }
  if (status === "not_coming") {
    return {
      label: "Regretfully Declined",
      className: "bg-secondary text-muted-foreground",
      dot: "bg-muted-foreground",
    };
  }
  return {
    label: "Awaiting Reply",
    className: "bg-secondary text-muted-foreground",
    dot: "bg-muted-foreground",
  };
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

const avatarTones = [
  "bg-accent text-accent-foreground",
  "bg-secondary text-foreground",
  "bg-muted text-foreground",
];

export function OverviewRsvpFeed({ rsvps, totalLabel }: OverviewRsvpFeedProps) {
  return (
    <section className="rounded-xl bg-card p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Latest RSVPs & Messages
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Real-time attendance responses from your wedding link
          </p>
        </div>
        <Link
          to="/dashboard/rsvp"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
        >
          View all {totalLabel} responses
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {rsvps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No RSVPs yet. Responses will appear here once guests reply.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rsvps.slice(0, 5).map((rsvp, index) => {
            const badge = statusBadge(rsvp.status, rsvp.party_size);
            return (
              <div
                key={rsvp.id}
                className="flex flex-col justify-between gap-2 rounded-xl bg-background p-2 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-start"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      avatarTones[index % avatarTones.length],
                    )}
                  >
                    {initials(rsvp.guest_name) || "?"}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-base font-semibold text-foreground">
                        {rsvp.guest_name}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          badge.className,
                        )}
                      >
                        <span className={cn("size-1.5 rounded-full", badge.dot)} />
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] italic text-muted-foreground">
                      {rsvp.message
                        ? `“${rsvp.message}”`
                        : "No message left."}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 self-start text-[11px] font-bold uppercase tracking-wide text-muted-foreground sm:self-auto">
                  {relativeTime(rsvp.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
