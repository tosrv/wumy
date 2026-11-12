import { describe, expect, it, vi } from "vitest";
import { escapeLike, markInvitationPaid, requireAdmin, type AdminDb } from "./service";

describe("escapeLike", () => {
  it("escapes LIKE wildcards", () => {
    expect(escapeLike("a_b%c\\d")).toBe("a\\_b\\%c\\\\d");
    expect(escapeLike("ayu-budi")).toBe("ayu-budi");
  });
});

/** Minimal chainable stub of the parts of the Supabase client these helpers use. */
function stubDb(opts: {
  user?: { id: string } | null;
  admin?: boolean;
  invitation?: { id: string; slug: string; payment_status: string } | null;
}) {
  const inserts: Record<string, unknown[]> = {};
  const rpc = vi.fn().mockResolvedValue({ error: null });
  const db = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: opts.user ?? null }, error: null }),
    },
    rpc,
    from(table: string) {
      const chain = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => {
          if (table === "admin_users") {
            return { data: opts.admin ? { user_id: opts.user?.id } : null, error: null };
          }
          return { data: opts.invitation ?? null, error: null };
        },
        insert(row: unknown) {
          (inserts[table] ??= []).push(row);
          return {
            select: () => ({ single: async () => ({ data: { id: "pay-1" }, error: null }) }),
            then: (resolve: (v: { error: null }) => void) => resolve({ error: null }),
          };
        },
      };
      return chain;
    },
  };
  return { db: db as unknown as AdminDb, inserts, rpc };
}

describe("requireAdmin", () => {
  it("returns the user id for an admin", async () => {
    const { db } = stubDb({ user: { id: "u1" }, admin: true });
    await expect(requireAdmin(db, "tok")).resolves.toBe("u1");
  });

  it("rejects signed-in non-admins and invalid tokens the same way", async () => {
    await expect(requireAdmin(stubDb({ user: { id: "u1" } }).db, "tok")).rejects.toThrow(
      "Not found",
    );
    await expect(requireAdmin(stubDb({ user: null }).db, "tok")).rejects.toThrow("Not found");
  });
});

describe("markInvitationPaid", () => {
  it("records a manual payment, marks it paid, and writes the audit log", async () => {
    const { db, inserts, rpc } = stubDb({
      invitation: { id: "inv-1", slug: "ayu-budi", payment_status: "unpaid" },
    });
    await expect(markInvitationPaid(db, "admin-1", "inv-1", "comp for a friend")).resolves.toEqual({
      alreadyPaid: false,
    });
    expect(inserts["payments"]).toEqual([
      expect.objectContaining({ invitation_id: "inv-1", amount_cents: 0, provider: "manual" }),
    ]);
    expect(rpc).toHaveBeenCalledWith("mark_invitation_paid", { p_payment_id: "pay-1" });
    expect(inserts["admin_audit_log"]).toEqual([
      expect.objectContaining({
        admin_id: "admin-1",
        action: "mark_paid",
        target_id: "inv-1",
        details: { slug: "ayu-budi", note: "comp for a friend", payment_id: "pay-1" },
      }),
    ]);
  });

  it("does nothing when the invitation is already paid", async () => {
    const { db, inserts, rpc } = stubDb({
      invitation: { id: "inv-1", slug: "x", payment_status: "paid" },
    });
    await expect(markInvitationPaid(db, "a", "inv-1", "note")).resolves.toEqual({
      alreadyPaid: true,
    });
    expect(inserts).toEqual({});
    expect(rpc).not.toHaveBeenCalled();
  });
});
