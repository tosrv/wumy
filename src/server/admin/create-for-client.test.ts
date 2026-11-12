import { describe, expect, it, vi } from "vitest";
import { createInvitationForClient, type AdminDb } from "./service";

type Row = Record<string, unknown>;

/** In-memory stand-in for the parts of the Supabase client the function uses. */
function fakeDb(opts: {
  users?: { id: string; email: string }[];
  admins?: string[];
  invitations?: Row[];
}) {
  const tables: Record<string, Row[]> = {
    admin_users: (opts.admins ?? []).map((user_id) => ({ user_id })),
    invitations: [...(opts.invitations ?? [])],
    payments: [],
    admin_audit_log: [],
  };
  const invite = vi.fn(async (email: string) => ({
    data: { user: { id: "new-user", email } },
    error: null,
  }));
  const rpc = vi.fn(async () => ({ error: null }));

  function query(table: string) {
    const filters: [string, unknown][] = [];
    const rows = () => tables[table]!.filter((r) => filters.every(([k, v]) => r[k] === v));
    const chain = {
      select: () => chain,
      eq: (k: string, v: unknown) => {
        filters.push([k, v]);
        return chain;
      },
      limit: async () => ({ data: rows(), error: null }),
      maybeSingle: async () => ({ data: rows()[0] ?? null, error: null }),
      insert(row: Row) {
        const stored = { id: `${table}-${tables[table]!.length + 1}`, ...row };
        tables[table]!.push(stored);
        const result = { data: { id: stored.id }, error: null };
        return {
          select: () => ({ single: async () => result }),
          then: (resolve: (v: { error: null }) => void) => resolve({ error: null }),
        };
      },
    };
    return chain;
  }

  const db = {
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: opts.users ?? [] }, error: null }),
        inviteUserByEmail: invite,
      },
    },
    from: query,
    rpc,
  } as unknown as AdminDb;
  return { db, tables, invite, rpc };
}

const deps = {
  slugFor: (a: string, b: string) => `${a}-${b}`.toLowerCase(),
  isReserved: (s: string) => s === "admin",
};
const input = {
  email: "Client@Example.com",
  partnerA: "Ayu",
  partnerB: "Budi",
  templateId: "minimal",
  markPaid: true,
  note: "Free invitation for a friend",
  setPasswordUrl: "https://wumy.test/reset-password",
};

describe("createInvitationForClient", () => {
  it("invites a new client, creates the draft, marks it paid, and logs it", async () => {
    const f = fakeDb({});
    const result = await createInvitationForClient(f.db, "admin-1", input, deps);

    expect(f.invite).toHaveBeenCalledWith("client@example.com", {
      redirectTo: "https://wumy.test/reset-password",
      data: { full_name: "Ayu & Budi" },
    });
    expect(result).toMatchObject({ slug: "ayu-budi", invited: true, paid: true });
    expect(f.tables["invitations"]![0]).toMatchObject({
      owner_id: "new-user",
      template_id: "minimal",
      slug: "ayu-budi",
      status: "draft",
      payment_status: "unpaid",
    });
    expect(f.rpc).toHaveBeenCalledWith("mark_invitation_paid", expect.anything());
    expect(f.tables["admin_audit_log"]!.map((r) => r["action"])).toEqual([
      "create_for_client",
      "mark_paid",
    ]);
  });

  it("reuses an existing account without inviting, and picks a free slug", async () => {
    const f = fakeDb({
      users: [{ id: "u1", email: "client@example.com" }],
      invitations: [{ id: "other", owner_id: "someone", slug: "ayu-budi" }],
    });
    const result = await createInvitationForClient(
      f.db,
      "admin-1",
      { ...input, markPaid: false },
      deps,
    );
    expect(f.invite).not.toHaveBeenCalled();
    expect(result).toMatchObject({ slug: "ayu-budi-2", invited: false, paid: false });
    expect(f.rpc).not.toHaveBeenCalled();
  });

  it("refuses a client that already has an invitation", async () => {
    const f = fakeDb({
      users: [{ id: "u1", email: "client@example.com" }],
      invitations: [{ id: "inv", owner_id: "u1", slug: "rina-dimas" }],
    });
    await expect(createInvitationForClient(f.db, "admin-1", input, deps)).rejects.toThrow(
      "already has an invitation (/rina-dimas)",
    );
  });

  it("refuses an admin's email", async () => {
    const f = fakeDb({ users: [{ id: "a1", email: "client@example.com" }], admins: ["a1"] });
    await expect(createInvitationForClient(f.db, "admin-1", input, deps)).rejects.toThrow(
      "admin account",
    );
  });
});
