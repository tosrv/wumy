import { describe, expect, it, vi } from "vitest";
import { changeInvitationTemplate, type AdminDb } from "./service";

function fakeDb(invitation: { id: string; slug: string; template_id: string } | null) {
  const logs: Record<string, unknown>[] = [];
  const updates: Record<string, unknown>[] = [];
  const db = {
    from(table: string) {
      const chain = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({ data: invitation, error: null }),
        update: (row: Record<string, unknown>) => {
          updates.push(row);
          return { eq: async () => ({ error: null }) };
        },
        insert: async (row: Record<string, unknown>) => {
          if (table === "admin_audit_log") logs.push(row);
          return { error: null };
        },
      };
      return chain;
    },
  } as unknown as AdminDb;
  return { db, logs, updates };
}

const exists = vi.fn((id: string) => ["minimal", "romantic"].includes(id));
const inv = { id: "inv-1", slug: "ayu-budi", template_id: "minimal" };

describe("changeInvitationTemplate", () => {
  it("updates the template and logs from/to", async () => {
    const f = fakeDb(inv);
    await expect(
      changeInvitationTemplate(f.db, "admin-1", "inv-1", "romantic", exists),
    ).resolves.toEqual({ changed: true });
    expect(f.updates).toEqual([{ template_id: "romantic" }]);
    expect(f.logs).toEqual([
      expect.objectContaining({
        action: "change_template",
        details: { slug: "ayu-budi", from: "minimal", to: "romantic" },
      }),
    ]);
  });

  it("does nothing when the template is unchanged", async () => {
    const f = fakeDb(inv);
    await expect(changeInvitationTemplate(f.db, "a", "inv-1", "minimal", exists)).resolves.toEqual({
      changed: false,
    });
    expect(f.updates).toEqual([]);
    expect(f.logs).toEqual([]);
  });

  it("rejects unknown templates and missing invitations", async () => {
    await expect(
      changeInvitationTemplate(fakeDb(inv).db, "a", "inv-1", "nope", exists),
    ).rejects.toThrow("Unknown template");
    await expect(
      changeInvitationTemplate(fakeDb(null).db, "a", "inv-1", "romantic", exists),
    ).rejects.toThrow("not found");
  });
});
