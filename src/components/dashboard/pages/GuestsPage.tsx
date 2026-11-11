import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  createInvitationGuest,
  deleteInvitationGuests,
  listInvitationGuests,
  listInvitationRsvps,
  listMyInvitations,
  type GuestRow,
  type InvitationRow,
} from "@/lib/invitations";
import type { Database } from "@/lib/supabase/database.types";
import { GuestsHeader } from "@/components/dashboard/sections/GuestsHeader";
import { GuestsMetrics } from "@/components/dashboard/sections/GuestsMetrics";
import {
  GuestsFilters,
  type GuestStatusFilter,
} from "@/components/dashboard/sections/GuestsFilters";
import {
  GuestsTable,
  type GuestListItem,
} from "@/components/dashboard/sections/GuestsTable";
import {
  GuestsAddDialog,
  type NewGuestInput,
} from "@/components/dashboard/sections/GuestsAddDialog";

type RsvpRow = Database["public"]["Tables"]["rsvps"]["Row"];

function guestHasResponded(guest: GuestRow, rsvps: RsvpRow[]) {
  return rsvps.some(
    (r) =>
      r.status !== "pending" &&
      (r.guest_id === guest.id ||
        r.guest_name.trim().toLowerCase() === guest.name.trim().toLowerCase()),
  );
}

export function GuestsPage() {
  const { user, configured } = useAuth();
  const [invitation, setInvitation] = useState<InvitationRow | null>(null);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<GuestStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);

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
      setError(err instanceof Error ? err.message : "Failed to load guests.");
    } finally {
      setLoading(false);
    }
  }, [user, configured]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const enriched: GuestListItem[] = useMemo(
    () =>
      guests.map((guest) => {
        const responded = guestHasResponded(guest, rsvps);
        const note =
          guest.note?.trim() ||
          guest.email ||
          (guest.personalization_key
            ? `Link key · ${guest.personalization_key}`
            : "Personalized link ready");
        return {
          ...guest,
          responded,
          group: guest.guest_group || "General",
          note,
        };
      }),
    [guests, rsvps],
  );

  const respondedCount = enriched.filter((g) => g.responded).length;
  const pendingCount = enriched.length - respondedCount;
  const linksOpened = respondedCount;

  const groups = useMemo(() => {
    const set = new Set(enriched.map((g) => g.group).filter(Boolean));
    return Array.from(set).sort();
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((g) => {
      if (status === "responded" && !g.responded) return false;
      if (status === "pending" && g.responded) return false;
      if (group !== "all" && g.group !== group) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.group.toLowerCase().includes(q) ||
        (g.personalization_key ?? "").toLowerCase().includes(q) ||
        g.note.toLowerCase().includes(q)
      );
    });
  }, [enriched, status, search, group]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [status, search, group, pageSize]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const metrics = [
    { label: "Total Guests", value: enriched.length },
    {
      label: "Links Opened",
      value: linksOpened,
    },
    {
      label: "Not Yet Responded",
      value: pendingCount,
    },
  ];

  async function handleSaveGuest(input: NewGuestInput) {
    if (!invitation) return;
    const created = await createInvitationGuest({
      invitationId: invitation.id,
      name: input.name,
      email: input.email,
      personalizationKey: input.personalizationKey,
      guestGroup: input.group,
      note: input.note,
    });
    setGuests((prev) => [created, ...prev]);
  }

  function openAdd() {
    if (!invitation) return;
    setAddOpen(true);
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0 || !invitation) return;
    const ids = Array.from(selectedIds);
    await deleteInvitationGuests(ids);
    setGuests((prev) => prev.filter((g) => !selectedIds.has(g.id)));
    setSelectedIds(new Set());
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 pb-16 md:px-8 md:py-8">
        <GuestsHeader
          total={enriched.length}
          responded={respondedCount}
          pending={pendingCount}
          linksOpened={linksOpened}
          hasInvitation={Boolean(invitation)}
          onAdd={openAdd}
        />

        {loading && (
          <p className="text-sm text-muted-foreground">Loading guests…</p>
        )}
        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <GuestsMetrics metrics={metrics} />
        <GuestsFilters
          status={status}
          onStatusChange={setStatus}
          counts={{
            all: enriched.length,
            responded: respondedCount,
            pending: pendingCount,
          }}
          search={search}
          onSearchChange={setSearch}
          group={group}
          onGroupChange={setGroup}
          groups={groups}
        />
        <GuestsTable
          invitation={invitation}
          guests={pageItems}
          totalFiltered={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          selectedIds={selectedIds}
          onSelectedChange={setSelectedIds}
          onDeleteSelected={() => void handleDeleteSelected()}
          onAdd={openAdd}
        />
      </main>

      <GuestsAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={handleSaveGuest}
      />
    </div>
  );
}
