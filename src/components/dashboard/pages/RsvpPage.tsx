import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  listInvitationGuests,
  listInvitationRsvps,
  listMyInvitations,
  type GuestRow,
  type InvitationRow,
} from "@/lib/invitations";
import type { Database } from "@/lib/supabase/database.types";
import { RsvpHeader } from "@/components/dashboard/sections/RsvpHeader";
import { RsvpMetrics } from "@/components/dashboard/sections/RsvpMetrics";
import {
  RsvpFilters,
  type RsvpSort,
  type RsvpStatusFilter,
} from "@/components/dashboard/sections/RsvpFilters";
import { RsvpFeed, type RsvpFeedItem } from "@/components/dashboard/sections/RsvpFeed";

type RsvpRow = Database["public"]["Tables"]["rsvps"]["Row"];

function mapStatus(status: RsvpRow["status"]): RsvpFeedItem["status"] {
  if (status === "coming") return "attending";
  if (status === "not_coming") return "declined";
  return "pending";
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function RsvpPage() {
  const { user, configured } = useAuth();
  const [invitation, setInvitation] = useState<InvitationRow | null>(null);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<RsvpStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [circle, setCircle] = useState("all");
  const [sort, setSort] = useState<RsvpSort>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const reload = useCallback(async () => {
    if (!user || !configured) return;
    setLoading(true);
    setError(null);
    try {
      const invitations = await listMyInvitations();
      const primary = invitations[0] ?? null;
      setInvitation(primary);
      if (!primary) {
        setGuests([]);
        setRsvps([]);
        return;
      }
      const [guestRows, rsvpRows] = await Promise.all([
        listInvitationGuests(primary.id),
        listInvitationRsvps(primary.id),
      ]);
      setGuests(guestRows);
      setRsvps(rsvpRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load RSVPs.");
    } finally {
      setLoading(false);
    }
  }, [user, configured]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const feedItems: RsvpFeedItem[] = useMemo(() => {
    const guestById = new Map(guests.map((g) => [g.id, g]));
    const respondedGuestIds = new Set(
      rsvps
        .filter((r) => r.status !== "pending")
        .map((r) => r.guest_id)
        .filter(Boolean),
    );
    const respondedNames = new Set(
      rsvps.filter((r) => r.status !== "pending").map((r) => r.guest_name.trim().toLowerCase()),
    );

    const fromRsvps: RsvpFeedItem[] = rsvps.map((r) => {
      const linked = r.guest_id ? guestById.get(r.guest_id) : undefined;
      return {
        id: r.id,
        name: r.guest_name,
        status: mapStatus(r.status),
        partySize: r.party_size,
        message: r.message?.trim() ?? "",
        circle: linked?.guest_group || "General",
        seating: null,
        createdAt: r.created_at,
      };
    });

    const pendingGuests: RsvpFeedItem[] = guests
      .filter((g) => {
        if (respondedGuestIds.has(g.id)) return false;
        if (respondedNames.has(g.name.trim().toLowerCase())) return false;
        return !rsvps.some(
          (r) =>
            r.status === "pending" &&
            (r.guest_id === g.id ||
              r.guest_name.trim().toLowerCase() === g.name.trim().toLowerCase()),
        );
      })
      .map((g) => ({
        id: `guest-${g.id}`,
        name: g.name,
        status: "pending" as const,
        partySize: 1,
        message: "",
        circle: g.guest_group || "General",
        seating: null,
        createdAt: g.created_at,
      }));

    return [...fromRsvps, ...pendingGuests];
  }, [rsvps, guests]);

  const attendingPax = useMemo(
    () =>
      feedItems.filter((i) => i.status === "attending").reduce((sum, i) => sum + i.partySize, 0),
    [feedItems],
  );
  const declinedPax = useMemo(
    () => feedItems.filter((i) => i.status === "declined").reduce((sum, i) => sum + i.partySize, 0),
    [feedItems],
  );
  const pendingCount = feedItems.filter((i) => i.status === "pending").length;
  const attendingCount = feedItems.filter((i) => i.status === "attending").length;
  const declinedCount = feedItems.filter((i) => i.status === "declined").length;
  const repliedCount = attendingCount + declinedCount;
  const totalTracking = Math.max(
    guests.length,
    attendingPax + declinedPax + pendingCount,
    feedItems.length,
  );

  const circles = useMemo(() => {
    const set = new Set(feedItems.map((i) => i.circle).filter(Boolean));
    return Array.from(set).sort();
  }, [feedItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = feedItems.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (circle !== "all" && item.circle !== circle) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        item.circle.toLowerCase().includes(q)
      );
    });

    rows = [...rows].sort((a, b) => {
      if (sort === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "pax-high") return b.partySize - a.partySize;
      return a.partySize - b.partySize;
    });

    return rows;
  }, [feedItems, status, search, circle, sort]);

  useEffect(() => {
    setPage(1);
  }, [status, search, circle, sort, pageSize]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const metrics = [
    {
      label: "Attending",
      value: attendingPax,
    },
    {
      label: "Awaiting Reply",
      value: pendingCount,
    },
    {
      label: "Declined",
      value: declinedPax,
    },
    {
      label: "Total Tracking",
      value: totalTracking,
    },
  ];

  function handleExport() {
    const header = ["Name", "Status", "Party Size", "Circle", "Message", "Created At"];
    const lines = [
      header.join(","),
      ...filtered.map((item) =>
        [
          csvEscape(item.name),
          item.status,
          String(item.partySize),
          csvEscape(item.circle),
          csvEscape(item.message),
          item.createdAt,
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invitation?.slug ?? "wumy"}-rsvp.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 pb-16 md:px-8 md:py-8">
        <RsvpHeader
          attending={attendingPax}
          replied={repliedCount}
          total={totalTracking}
          hasInvitation={Boolean(invitation)}
          onExport={handleExport}
        />

        {loading && <p className="text-sm text-muted-foreground">Loading RSVPs…</p>}
        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        )}

        <RsvpMetrics metrics={metrics} />
        <RsvpFilters
          status={status}
          onStatusChange={setStatus}
          counts={{
            all: feedItems.length,
            attending: attendingCount,
            pending: pendingCount,
            declined: declinedCount,
          }}
          search={search}
          onSearchChange={setSearch}
          circle={circle}
          onCircleChange={setCircle}
          circles={circles}
          sort={sort}
          onSortChange={setSort}
        />
        <RsvpFeed
          items={pageItems}
          totalFiltered={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </main>
    </div>
  );
}
