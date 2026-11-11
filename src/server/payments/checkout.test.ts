import { describe, expect, it, vi } from "vitest";
import { emptyContent, type InvitationContent } from "@/lib/invitation-content";
import type { InvitationRow } from "@/lib/invitations";
import { CheckoutError, startCheckout, type CheckoutDeps } from "./checkout";

const NOW = new Date("2026-11-10T03:00:00Z");
const INV_ID = "1a2b3c4d-0000-4000-8000-000000000000";
const EXPIRES = new Date("2026-11-10T04:00:00Z");

const p = { fullName: "", nickname: "", fatherName: "", motherName: "", childOrder: "" };
const completeContent = (): InvitationContent => ({
  ...emptyContent(),
  partners: { a: { ...p, nickname: "Sinta" }, b: { ...p, nickname: "Rama" } },
  events: [
    {
      id: "e1",
      kind: "resepsi",
      title: "",
      date: "2027-08-24",
      startTime: "09:00",
      endTime: "",
      venueName: "Gedung",
      venueAddress: "",
      mapsUrl: "",
    },
  ],
});

function row(over: Partial<InvitationRow> = {}): InvitationRow {
  return {
    id: INV_ID,
    owner_id: "user-1",
    template_id: "t1",
    slug: "sinta-rama",
    partner_a_name: "Sinta",
    partner_b_name: "Rama",
    wedding_date: null,
    venue_name: "",
    venue_address: "",
    story: "",
    content: completeContent(),
    status: "draft",
    payment_status: "unpaid",
    published_at: null,
    created_at: "",
    updated_at: "",
    ...over,
  } as InvitationRow;
}

function makeDeps(over: Partial<CheckoutDeps> = {}) {
  const deps = {
    getInvitation: vi.fn(async () => row()),
    findReusablePending: vi.fn(async () => null),
    getCustomer: vi.fn(async () => ({ name: "Sinta", email: "sinta@example.com" })),
    insertPending: vi.fn(async () => {}),
    createCheckout: vi.fn(async () => ({
      url: "https://doku.test/pay/abc",
      tokenId: "tok-1",
      expiresAt: EXPIRES,
    })),
    siteUrl: "https://wumy.id",
    amountIdr: 199000,
    now: () => NOW,
    ...over,
  } satisfies CheckoutDeps;
  return deps;
}

const input = { userId: "user-1", invitationId: INV_ID };

async function expectCode(deps: CheckoutDeps, code: CheckoutError["code"]) {
  const err = await startCheckout(deps, input).catch((e: unknown) => e);
  expect(err).toBeInstanceOf(CheckoutError);
  expect((err as CheckoutError).code).toBe(code);
  return err as CheckoutError;
}

describe("startCheckout", () => {
  it("missing invitation → not_found", async () => {
    await expectCode(makeDeps({ getInvitation: vi.fn(async () => null) }), "not_found");
  });

  it("other owner → not_found", async () => {
    const deps = makeDeps({ getInvitation: vi.fn(async () => row({ owner_id: "user-2" })) });
    await expectCode(deps, "not_found");
    expect(deps.createCheckout).not.toHaveBeenCalled();
  });

  it("paid → already_paid", async () => {
    const deps = makeDeps({ getInvitation: vi.fn(async () => row({ payment_status: "paid" })) });
    await expectCode(deps, "already_paid");
  });

  it("paid with reusable pending → already_paid, no reuse lookup", async () => {
    const deps = makeDeps({
      getInvitation: vi.fn(async () => row({ payment_status: "paid" })),
      findReusablePending: vi.fn(async () => ({ checkout_url: "https://doku.test/pay/old" })),
    });
    await expectCode(deps, "already_paid");
    expect(deps.findReusablePending).not.toHaveBeenCalled();
  });

  it("archived → incomplete", async () => {
    const deps = makeDeps({ getInvitation: vi.fn(async () => row({ status: "archived" })) });
    const err = await expectCode(deps, "incomplete");
    expect(err.message).toBe("Invitation is archived");
    expect(deps.findReusablePending).not.toHaveBeenCalled();
    expect(deps.createCheckout).not.toHaveBeenCalled();
  });

  it("checks out an invitation with empty content and a draft slug", async () => {
    const deps = makeDeps({
      getInvitation: vi.fn(async () => row({ content: emptyContent(), slug: "draft-abc123" })),
    });
    await expect(startCheckout(deps, input)).resolves.toEqual({ url: "https://doku.test/pay/abc" });
    expect(deps.createCheckout).toHaveBeenCalledTimes(1);
  });

  it("reuses pending checkout", async () => {
    const deps = makeDeps({
      findReusablePending: vi.fn(async () => ({ checkout_url: "https://doku.test/pay/old" })),
    });
    await expect(startCheckout(deps, input)).resolves.toEqual({
      url: "https://doku.test/pay/old",
    });
    expect(deps.findReusablePending).toHaveBeenCalledWith(
      INV_ID,
      new Date(NOW.getTime() + 5 * 60_000),
      199000,
    );
    expect(deps.createCheckout).not.toHaveBeenCalled();
    expect(deps.insertPending).not.toHaveBeenCalled();
  });

  it("new checkout → createCheckout then insertPending", async () => {
    const deps = makeDeps();
    await expect(startCheckout(deps, input)).resolves.toEqual({ url: "https://doku.test/pay/abc" });

    expect(deps.createCheckout).toHaveBeenCalledTimes(1);
    const ci = vi.mocked(deps.createCheckout).mock.calls[0]![0];
    expect(ci.invoiceNumber).toMatch(/^WUMY1A2B3C4D[0-9A-Z]+$/);
    expect(ci).toEqual({
      invoiceNumber: ci.invoiceNumber,
      amount: 199000,
      customerName: "Sinta",
      customerEmail: "sinta@example.com",
      callbackUrl: `https://wumy.id/payment/status?invoice=${ci.invoiceNumber}`,
      dueMinutes: 60,
    });
    expect(deps.getCustomer).toHaveBeenCalledWith("user-1");
    expect(deps.insertPending).toHaveBeenCalledWith({
      invitation_id: INV_ID,
      invoice_number: ci.invoiceNumber,
      checkout_url: "https://doku.test/pay/abc",
      provider_ref: "tok-1",
      expires_at: EXPIRES,
      amount_idr: 199000,
    });
  });

  it("charges the configured price", async () => {
    const deps = makeDeps({ amountIdr: 10000 });
    await startCheckout(deps, input);
    expect(vi.mocked(deps.createCheckout).mock.calls[0]![0].amount).toBe(10000);
    expect(deps.findReusablePending).toHaveBeenCalledWith(INV_ID, expect.any(Date), 10000);
    expect(vi.mocked(deps.insertPending).mock.calls[0]![0].amount_idr).toBe(10000);
  });
});
