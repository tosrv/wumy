import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listMyInvitations: vi.fn(),
  updateInvitationTemplate: vi.fn(),
  createDraftInvitation: vi.fn(),
  isSlugAvailable: vi.fn(),
}));
vi.mock("@/lib/invitations", () => mocks);

import { ensureOrderInvitation, orderRedirect } from "./order";

describe("orderRedirect", () => {
  it("sends anyone who has not paid to the order page", () => {
    expect(orderRedirect(null)).toBe("order");
    expect(orderRedirect({ payment_status: "unpaid" })).toBe("order");
    expect(orderRedirect({ payment_status: "pending" })).toBe("order");
  });
  it("lets a paid invitation into the editor", () => {
    expect(orderRedirect({ payment_status: "paid" })).toBe("editor");
  });
});

describe("ensureOrderInvitation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.isSlugAvailable.mockResolvedValue(true);
  });

  it("redirects a paid invitation to the editor without changing its template", async () => {
    const inv = { id: "i1", template_id: "minimal", payment_status: "paid" };
    mocks.listMyInvitations.mockResolvedValue([inv]);
    const r = await ensureOrderInvitation("u1", "romantic");
    expect(r).toEqual({ invitation: inv, redirectToEditor: true });
    expect(mocks.updateInvitationTemplate).not.toHaveBeenCalled();
  });

  it("updates the template of an unpaid invitation", async () => {
    const inv = { id: "i1", template_id: "minimal", payment_status: "unpaid" };
    mocks.listMyInvitations.mockResolvedValue([inv]);
    mocks.updateInvitationTemplate.mockResolvedValue({ ...inv, template_id: "romantic" });
    const r = await ensureOrderInvitation("u1", "romantic");
    expect(mocks.updateInvitationTemplate).toHaveBeenCalledWith("i1", "romantic");
    expect(r).toMatchObject({ redirectToEditor: false, invitation: { template_id: "romantic" } });
  });

  it("keeps the current template for an unknown template id", async () => {
    const inv = { id: "i1", template_id: "minimal", payment_status: "unpaid" };
    mocks.listMyInvitations.mockResolvedValue([inv]);
    const r = await ensureOrderInvitation("u1", "nope");
    expect(mocks.updateInvitationTemplate).not.toHaveBeenCalled();
    expect(r).toMatchObject({ invitation: inv });
  });

  it("asks for a template first when none exists and no valid id is given", async () => {
    mocks.listMyInvitations.mockResolvedValue([]);
    expect(await ensureOrderInvitation("u1", "nope")).toEqual({ needsTemplate: true });
    expect(await ensureOrderInvitation("u1")).toEqual({ needsTemplate: true });
    expect(mocks.createDraftInvitation).not.toHaveBeenCalled();
  });

  it("creates a draft with the chosen template when none exists", async () => {
    mocks.listMyInvitations.mockResolvedValue([]);
    mocks.createDraftInvitation.mockImplementation(
      async (_u: string, i: { templateId: string }) => ({
        id: "new",
        template_id: i.templateId,
        payment_status: "unpaid",
      }),
    );
    const r = await ensureOrderInvitation("u1", "romantic");
    expect(mocks.createDraftInvitation.mock.calls[0]![1].templateId).toBe("romantic");
    expect(mocks.createDraftInvitation.mock.calls[0]![1].slug).toMatch(/^draft-/);
    expect(r).toMatchObject({ redirectToEditor: false });
  });

  it("shares one run between concurrent calls for the same user", async () => {
    mocks.listMyInvitations.mockResolvedValue([]);
    mocks.createDraftInvitation.mockResolvedValue({
      id: "new",
      template_id: "minimal",
      payment_status: "unpaid",
    });
    const [a, b] = await Promise.all([
      ensureOrderInvitation("u1", "minimal"),
      ensureOrderInvitation("u1", "minimal"),
    ]);
    expect(mocks.createDraftInvitation).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it("uses the existing invitation when the insert hits the owner unique index", async () => {
    const inv = { id: "other", template_id: "minimal", payment_status: "unpaid" };
    mocks.listMyInvitations.mockResolvedValueOnce([]).mockResolvedValueOnce([inv]);
    mocks.createDraftInvitation.mockRejectedValue(
      new Error('duplicate key value violates unique constraint "invitations_owner_unique"'),
    );
    const r = await ensureOrderInvitation("u1", "minimal");
    expect(r).toEqual({ invitation: inv, redirectToEditor: false });
  });

  it("rethrows other insert errors", async () => {
    mocks.listMyInvitations.mockResolvedValue([]);
    mocks.createDraftInvitation.mockRejectedValue(new Error("boom"));
    await expect(ensureOrderInvitation("u1", "minimal")).rejects.toThrow("boom");
  });
});
