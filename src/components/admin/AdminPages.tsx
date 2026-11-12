import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  checkIsAdmin,
  fetchAdminAuditLog,
  fetchAdminInvitations,
  fetchAdminPayments,
  markInvitationPaidAsAdmin,
} from "@/lib/admin";
import type { PaymentStatus } from "@/lib/supabase/database.types";
import type { AdminAuditEntry, AdminInvitation, AdminPayment } from "@/server/admin/service";
import { NotFoundPage } from "@/components/NotFoundPage";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(iso: string | null): string {
  return iso ? dateFormat.format(new Date(iso)) : "—";
}

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "paid" || status === "published"
      ? "default"
      : status === "failed" || status === "refunded"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

/** Simple page state for a paginated list. */
function usePagedList<T>(load: (page: number) => Promise<{ rows: T[]; hasMore: boolean }>) {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await load(page);
      setRows(result.rows);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error(err);
      setError("Failed to load. Try again.");
    } finally {
      setLoading(false);
    }
  }, [load, page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { page, setPage, rows, hasMore, loading, error, reload };
}

function Pager({
  page,
  hasMore,
  onChange,
}: {
  page: number;
  hasMore: boolean;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="text-muted-foreground">Page {page + 1}</span>
      <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}

function ListState({
  loading,
  error,
  empty,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  children: ReactNode;
}) {
  if (error) return <p className="py-8 text-center text-sm text-destructive">{error}</p>;
  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>;
  if (empty) return <p className="py-8 text-center text-sm text-muted-foreground">Nothing here.</p>;
  return <>{children}</>;
}

function MarkPaidDialog({
  invitation,
  onClose,
  onDone,
}: {
  invitation: AdminInvitation | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNote("");
    setError(null);
  }, [invitation]);

  async function submit() {
    if (!invitation) return;
    if (note.trim().length < 3) {
      setError("Add a short reason (at least 3 characters).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await markInvitationPaidAsAdmin(invitation.id, note.trim());
      onDone(
        result.alreadyPaid
          ? `/${invitation.slug} was already paid.`
          : `/${invitation.slug} marked as paid.`,
      );
    } catch (err) {
      console.error(err);
      setError("Failed to mark as paid. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={invitation !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark /{invitation?.slug} as paid?</DialogTitle>
          <DialogDescription>
            Records a Rp0 manual payment and unlocks publishing. The owner still presses Publish in
            the editor. This is written to the activity log.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason, e.g. free invitation for a friend, DOKU webhook missed (INV-…)"
          maxLength={500}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={busy}>
            {busy ? "Saving…" : "Mark as paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PageBody({ children }: { children: ReactNode }) {
  return (
    <main className="flex w-full flex-1 flex-col px-4 py-6 pb-16 md:px-8 md:py-8">{children}</main>
  );
}

export function AdminInvitationsPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<AdminInvitation | null>(null);
  const load = useCallback((page: number) => fetchAdminInvitations(page, search), [search]);
  const list = usePagedList(load);

  return (
    <PageBody>
      <PageHeader
        title="Invitations"
        description="Every invitation, newest first. Mark one as paid for a free invitation or a missed DOKU webhook."
      />
      {notice && (
        <div className="mb-4 flex items-center justify-between rounded-md border bg-secondary px-4 py-2 text-sm">
          <span>{notice}</span>
          <button type="button" className="text-muted-foreground" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          list.setPage(0);
          setSearch(searchInput.trim());
        }}
      >
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by slug"
          className="max-w-xs"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      <ListState loading={list.loading} error={list.error} empty={list.rows.length === 0}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Couple</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.rows.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {inv.status === "published" ? (
                      <a
                        href={`/${inv.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        /{inv.slug}
                      </a>
                    ) : (
                      `/${inv.slug}`
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {[inv.partnerA, inv.partnerB].filter(Boolean).join(" & ") || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{inv.ownerEmail ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(inv.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {inv.paymentStatus !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => setTarget(inv)}>
                        Mark as paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ListState>
      <Pager page={list.page} hasMore={list.hasMore} onChange={list.setPage} />
      <MarkPaidDialog
        invitation={target}
        onClose={() => setTarget(null)}
        onDone={(message) => {
          setTarget(null);
          setNotice(message);
          void list.reload();
        }}
      />
    </PageBody>
  );
}

const PAYMENT_FILTERS: (PaymentStatus | "all")[] = ["all", "pending", "paid", "failed", "refunded"];

export function AdminPaymentsPage() {
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const load = useCallback(
    (page: number) => fetchAdminPayments(page, status === "all" ? undefined : status),
    [status],
  );
  const list = usePagedList(load);

  return (
    <PageBody>
      <PageHeader title="Payments" description="All payments, including DOKU and manual ones." />
      <div className="mb-4 flex flex-wrap gap-2">
        {PAYMENT_FILTERS.map((value) => (
          <Button
            key={value}
            size="sm"
            variant={status === value ? "default" : "outline"}
            onClick={() => {
              list.setPage(0);
              setStatus(value);
            }}
          >
            {value}
          </Button>
        ))}
      </div>
      <ListState loading={list.loading} error={list.error} empty={list.rows.length === 0}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invitation</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.rows.map((p: AdminPayment) => (
                <TableRow key={p.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {p.invitationSlug ? `/${p.invitationSlug}` : "—"}
                  </TableCell>
                  <TableCell>{rupiah.format(p.amountIdr)}</TableCell>
                  <TableCell>{p.provider}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.invoiceNumber ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(p.paidAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ListState>
      <Pager page={list.page} hasMore={list.hasMore} onChange={list.setPage} />
    </PageBody>
  );
}

export function AdminActivityPage() {
  const load = useCallback((page: number) => fetchAdminAuditLog(page), []);
  const list = usePagedList(load);

  return (
    <PageBody>
      <PageHeader title="Activity" description="Every action taken by an admin." />
      <ListState loading={list.loading} error={list.error} empty={list.rows.length === 0}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.rows.map((entry: AdminAuditEntry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </TableCell>
                  <TableCell>{entry.adminEmail ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{entry.action}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md break-all font-mono text-xs">
                    {entry.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ListState>
      <Pager page={list.page} hasMore={list.hasMore} onChange={list.setPage} />
    </PageBody>
  );
}

/** /admin layout: only admins get the shell; everyone else sees the normal 404. */
export function AdminLayout() {
  const { user, loading } = useAuth();
  const [access, setAccess] = useState<"checking" | "admin" | "denied">("checking");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setAccess("denied");
      return;
    }
    let cancelled = false;
    setAccess("checking");
    checkIsAdmin()
      .then((isAdmin) => {
        if (!cancelled) setAccess(isAdmin ? "admin" : "denied");
      })
      .catch(() => {
        if (!cancelled) setAccess("denied");
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  if (access === "denied") return <NotFoundPage />;
  if (access === "checking") return <div className="min-h-screen bg-background" />;

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
