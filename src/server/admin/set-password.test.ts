import { describe, expect, it, vi } from "vitest";
import { isStrongPassword } from "@/lib/password";
import { setClientPassword, type AdminDb } from "./service";

function fakeDb(opts: {
  invitation?: { id: string; slug: string; owner_id: string } | null;
  admin?: boolean;
}) {
  const logs: Record<string, unknown>[] = [];
  const update = vi.fn(async () => ({
    data: { user: { email: "client@example.com" } },
    error: null,
  }));
  const db = {
    auth: { admin: { updateUserById: update } },
    from(table: string) {
      const chain = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => {
          if (table === "admin_users") return { data: opts.admin ? { user_id: "u1" } : null };
          return { data: opts.invitation ?? null, error: null };
        },
        insert: async (row: Record<string, unknown>) => {
          logs.push(row);
          return { error: null };
        },
      };
      return chain;
    },
  } as unknown as AdminDb;
  return { db, update, logs };
}

const invitation = { id: "inv-1", slug: "ayu-budi", owner_id: "u1" };
const strong = "Rahasia123!";

describe("setClientPassword", () => {
  it("updates the owner's password and logs it without the password", async () => {
    const f = fakeDb({ invitation });
    await expect(
      setClientPassword(f.db, "admin-1", "inv-1", strong, isStrongPassword),
    ).resolves.toEqual({ email: "client@example.com" });
    expect(f.update).toHaveBeenCalledWith("u1", { password: strong });
    expect(f.logs).toEqual([
      expect.objectContaining({
        action: "set_client_password",
        details: { slug: "ayu-budi", email: "client@example.com" },
      }),
    ]);
    expect(JSON.stringify(f.logs)).not.toContain(strong);
  });

  it("rejects a weak password before touching the account", async () => {
    const f = fakeDb({ invitation });
    await expect(
      setClientPassword(f.db, "a", "inv-1", "rahasia123", isStrongPassword),
    ).rejects.toThrow("not strong enough");
    expect(f.update).not.toHaveBeenCalled();
  });

  it("refuses admin accounts and missing invitations", async () => {
    const admin = fakeDb({ invitation, admin: true });
    await expect(
      setClientPassword(admin.db, "a", "inv-1", strong, isStrongPassword),
    ).rejects.toThrow("admin account");
    expect(admin.update).not.toHaveBeenCalled();
    await expect(
      setClientPassword(fakeDb({ invitation: null }).db, "a", "inv-1", strong, isStrongPassword),
    ).rejects.toThrow("not found");
  });
});
