import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Quote, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export type RsvpFeedItem = {
  id: string;
  name: string;
  status: "attending" | "pending" | "declined";
  partySize: number;
  message: string;
  circle: string;
  seating: string | null;
  createdAt: string;
};

interface RsvpFeedProps {
  items: RsvpFeedItem[];
  totalFiltered: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return `Yesterday, ${new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return `${days} days ago`;
}

function statusLabel(item: RsvpFeedItem) {
  if (item.status === "attending") {
    if (item.partySize <= 1) return "Attending (Solo)";
    if (item.partySize === 2) return "Attending (+1 Guest)";
    return `Attending (${item.partySize} Pax Total)`;
  }
  if (item.status === "declined") return "Regretfully Declined";
  return "Awaiting Reply";
}

const avatarTones = [
  "bg-accent text-accent-foreground",
  "bg-secondary text-foreground",
  "bg-muted text-foreground",
  "bg-accent/80 text-accent-foreground",
];

export function RsvpFeed({
  items,
  totalFiltered,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: RsvpFeedProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const from = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalFiltered);

  async function copyBlessing(item: RsvpFeedItem) {
    if (!item.message) return;
    try {
      await navigator.clipboard.writeText(item.message);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  }

  const pageButtons = (() => {
    const pages: (number | "…")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  })();

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center shadow-sm">
          <p className="font-display text-lg font-bold">No responses found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another filter, or wait for guests to reply to your invitation.
          </p>
        </div>
      ) : (
        items.map((item, index) => (
          <article
            key={item.id}
            className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-sm",
                    item.status === "pending"
                      ? "bg-secondary text-muted-foreground"
                      : avatarTones[index % avatarTones.length],
                  )}
                >
                  {initials(item.name) || "?"}
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="truncate text-lg font-semibold text-foreground">
                    {item.name}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                      item.circle.toLowerCase().includes("vip")
                        ? "bg-[oklch(0.9_0.08_160)] font-bold text-[oklch(0.35_0.1_160)]"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {item.circle}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                    item.status === "attending" && "bg-accent/80 text-accent-foreground",
                    item.status === "declined" && "bg-secondary text-muted-foreground",
                    item.status === "pending" && "bg-secondary text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      item.status === "attending" && "bg-primary",
                      item.status === "declined" && "bg-muted-foreground",
                      item.status === "pending" && "bg-foreground",
                    )}
                  />
                  {statusLabel(item)}
                </span>
                {item.seating ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    <UtensilsCrossed className="size-3.5 text-[oklch(0.45_0.1_160)]" />
                    {item.seating}
                  </span>
                ) : item.status === "pending" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    Seating unassigned
                  </span>
                ) : null}
                <span className="ml-1 text-[11px] font-bold text-muted-foreground">
                  {relativeTime(item.createdAt)}
                </span>
                {item.message ? (
                  <button
                    type="button"
                    onClick={() => void copyBlessing(item)}
                    className="flex size-8 items-center justify-center rounded-lg bg-secondary/70 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Copy blessing"
                  >
                    {copiedId === item.id ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            {item.message ? (
              <div className="flex items-start gap-2 rounded-xl bg-secondary/70 p-3.5">
                <Quote
                  className={cn(
                    "mt-0.5 size-6 shrink-0",
                    item.status === "declined" ? "text-muted-foreground" : "text-accent",
                  )}
                />
                <p className="flex-1 text-sm italic leading-relaxed text-foreground">
                  “{item.message}”
                </p>
              </div>
            ) : null}
          </article>
        ))
      )}

      <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-4 sm:flex-row">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
          <span>
            Showing{" "}
            <strong className="text-foreground">
              {from} – {to}
            </strong>{" "}
            of <strong className="text-foreground">{totalFiltered}</strong> responses
          </span>
          <span>•</span>
          <label className="flex items-center gap-1.5">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="cursor-pointer rounded-lg bg-card px-2 py-1 font-semibold text-foreground focus:outline-none"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex size-9 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm transition-all hover:bg-secondary hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          {pageButtons.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-1 font-bold text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl text-xs font-bold shadow-sm transition-all",
                  p === page
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-foreground hover:bg-secondary",
                )}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex size-9 items-center justify-center rounded-xl bg-card text-foreground shadow-sm transition-all hover:bg-secondary disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
