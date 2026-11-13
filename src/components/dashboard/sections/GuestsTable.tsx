import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  MessageCircle,
  MoreVertical,
  Tag,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  guestPublicLink,
  guestPublicUrl,
  type GuestRow,
  type InvitationRow,
} from "@/lib/invitations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export type GuestListItem = GuestRow & {
  responded: boolean;
  group: string;
  note: string;
};

interface GuestsTableProps {
  invitation: InvitationRow | null;
  guests: GuestListItem[];
  totalFiltered: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedIds: Set<string>;
  onSelectedChange: (ids: Set<string>) => void;
  onDeleteSelected: () => void;
  onAdd: () => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const avatarTones = [
  "bg-accent text-accent-foreground",
  "bg-secondary text-foreground",
  "bg-muted text-foreground",
];

export function GuestsTable({
  invitation,
  guests,
  totalFiltered,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  selectedIds,
  onSelectedChange,
  onDeleteSelected,
  onAdd,
}: GuestsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const allOnPageSelected = guests.length > 0 && guests.every((g) => selectedIds.has(g.id));
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const from = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalFiltered);

  function toggleAll(checked: boolean) {
    const next = new Set(selectedIds);
    if (checked) {
      guests.forEach((g) => next.add(g.id));
    } else {
      guests.forEach((g) => next.delete(g.id));
    }
    onSelectedChange(next);
  }

  function toggleOne(id: string, checked: boolean) {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectedChange(next);
  }

  async function copyLink(guest: GuestListItem) {
    if (!invitation) return;
    const link = guestPublicUrl(invitation.slug, guest);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(guest.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // ignore
    }
  }

  function openWhatsApp(guest: GuestListItem) {
    if (!invitation) return;
    const link = guestPublicUrl(invitation.slug, guest);
    const text = encodeURIComponent(`Hi ${guest.name}! You're invited — ${link}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
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
    <div className="flex flex-col overflow-hidden rounded-xl bg-card shadow-sm">
      {selectedIds.size > 0 && (
        <div className="flex flex-col items-start justify-between gap-2 bg-accent px-3.5 py-2.5 text-accent-foreground sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            <span className="text-sm font-bold">{selectedIds.size} guests selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-lg bg-electric-lime text-charcoal hover:bg-electric-lime/80"
              onClick={() => {
                const first = guests.find((g) => selectedIds.has(g.id));
                if (first) openWhatsApp(first);
              }}
            >
              <MessageCircle className="size-3.5" />
              Send WhatsApp Reminder
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-lg bg-electric-lime text-charcoal hover:bg-electric-lime/80"
              disabled
            >
              <Tag className="size-3.5" />
              Assign Group
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 rounded-lg shadow-sm"
              onClick={onDeleteSelected}
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {guests.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-3 flex size-16 items-center justify-center rounded-xl bg-secondary text-muted-foreground shadow-inner">
            <UserPlus className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No guests found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try adjusting your filter tags or search keyword, or quickly add a new attendee.
          </p>
          <Button
            type="button"
            className="mt-4 h-9 rounded-xl bg-accent font-bold text-accent-foreground shadow-sm hover:bg-accent/90"
            onClick={onAdd}
          >
            <UserPlus className="size-4" />+ Add your first guest
          </Button>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-secondary/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="w-12 py-3.5 pl-3.5 pr-2 text-center">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={(v) => toggleAll(v === true)}
                    aria-label="Select all on page"
                  />
                </th>
                <th className="px-3.5 py-3.5">Guest & Note</th>
                <th className="px-3.5 py-3.5">Circle / Tag</th>
                <th className="px-3.5 py-3.5">Personalized Invitation Link</th>
                <th className="py-3.5 pl-2 pr-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, index) => {
                const linkLabel = invitation
                  ? guestPublicLink(invitation.slug, guest)
                  : guest.personalization_key || "—";
                return (
                  <tr key={guest.id} className="transition-colors hover:bg-secondary/40">
                    <td className="py-3.5 pl-3.5 pr-2 text-center">
                      <Checkbox
                        checked={selectedIds.has(guest.id)}
                        onCheckedChange={(v) => toggleOne(guest.id, v === true)}
                        aria-label={`Select ${guest.name}`}
                      />
                    </td>
                    <td className="px-3.5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            avatarTones[index % avatarTones.length],
                          )}
                        >
                          {initials(guest.name) || "?"}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-bold text-foreground">
                              {guest.name}
                            </span>
                            {guest.responded ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.9_0.08_160)] px-2 py-0.5 text-[11px] font-semibold text-[oklch(0.35_0.1_160)]">
                                <span className="size-1.5 rounded-full bg-[oklch(0.45_0.1_160)]" />
                                Responded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-muted-foreground" />
                                Not yet
                              </span>
                            )}
                          </div>
                          <span className="truncate text-xs text-muted-foreground">
                            {guest.note}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          guest.group === "VIP"
                            ? "bg-accent/60 text-foreground"
                            : "bg-secondary text-foreground",
                        )}
                      >
                        {guest.group}
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5">
                      <div className="flex w-fit items-center gap-1.5 rounded-lg bg-secondary/70 px-2.5 py-1">
                        <span className="max-w-[220px] truncate font-mono text-xs text-muted-foreground">
                          {linkLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => void copyLink(guest)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          title="Copy link"
                        >
                          {copiedId === guest.id ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 pl-2 pr-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openWhatsApp(guest)}
                          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title="Quick WhatsApp"
                        >
                          <MessageCircle className="size-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title="Options"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-3 bg-card p-3.5 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">
              {from} - {to}
            </span>{" "}
            of {totalFiltered} guests
          </span>
          <div className="h-4 w-px bg-border" />
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="cursor-pointer rounded-lg bg-secondary/70 px-2 py-1 text-[11px] font-bold text-foreground focus:outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex h-8 items-center gap-1 rounded-lg bg-secondary/70 px-2.5 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" /> Prev
          </button>
          {pageButtons.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "h-8 w-8 rounded-lg text-[11px] font-bold transition-colors",
                  p === page
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/70",
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
            className="flex h-8 items-center gap-1 rounded-lg bg-secondary/70 px-2.5 text-[11px] font-bold text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            Next <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
