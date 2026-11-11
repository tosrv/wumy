import type { InvitationRow } from "@/lib/invitations";
import { buildInvoiceNumber } from "./invoice";

const REUSE_MIN_REMAINING_MS = 5 * 60_000;
const DUE_MINUTES = 60;

export type CheckoutErrorCode = "not_found" | "already_paid" | "incomplete";

export class CheckoutError extends Error {
  readonly code: CheckoutErrorCode;
  constructor(code: CheckoutErrorCode, message: string) {
    super(message);
    this.name = "CheckoutError";
    this.code = code;
  }
}

export type PendingPaymentInsert = {
  invitation_id: string;
  invoice_number: string;
  checkout_url: string;
  provider_ref: string;
  expires_at: Date;
  amount_idr: number;
};

export type CheckoutDeps = {
  getInvitation(id: string): Promise<InvitationRow | null>;
  /** Only a pending checkout created at `amountIdr` is reusable (the price may change). */
  findReusablePending(
    invitationId: string,
    minExpiry: Date,
    amountIdr: number,
  ): Promise<{ checkout_url: string } | null>;
  getCustomer(userId: string): Promise<{ name: string; email: string }>;
  insertPending(row: PendingPaymentInsert): Promise<void>;
  /** Task 3's `createCheckout` with `cfg` already bound. */
  createCheckout(input: {
    invoiceNumber: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    callbackUrl: string;
    dueMinutes: number;
  }): Promise<{ url: string; tokenId: string; expiresAt: Date }>;
  siteUrl: string;
  /** Publish fee in whole rupiah. */
  amountIdr: number;
  now(): Date;
};

export async function startCheckout(
  deps: CheckoutDeps,
  input: { userId: string; invitationId: string },
): Promise<{ url: string }> {
  const invitation = await deps.getInvitation(input.invitationId);
  // Another user's invitation is reported as missing so its existence is not revealed.
  if (!invitation || invitation.owner_id !== input.userId) {
    throw new CheckoutError("not_found", "Invitation not found");
  }
  if (invitation.payment_status === "paid") {
    throw new CheckoutError("already_paid", "Invitation is already paid");
  }
  // Paying would let mark_invitation_paid un-archive and publish it.
  if (invitation.status === "archived") {
    throw new CheckoutError("incomplete", "Invitation is archived");
  }

  const now = deps.now();
  const reusable = await deps.findReusablePending(
    invitation.id,
    new Date(now.getTime() + REUSE_MIN_REMAINING_MS),
    deps.amountIdr,
  );
  if (reusable) return { url: reusable.checkout_url };

  const customer = await deps.getCustomer(input.userId);
  const invoiceNumber = buildInvoiceNumber(invitation.id, now);
  const checkout = await deps.createCheckout({
    invoiceNumber,
    amount: deps.amountIdr,
    customerName: customer.name,
    customerEmail: customer.email,
    callbackUrl: `${deps.siteUrl}/payment/status?invoice=${invoiceNumber}`,
    dueMinutes: DUE_MINUTES,
  });
  await deps.insertPending({
    invitation_id: invitation.id,
    invoice_number: invoiceNumber,
    checkout_url: checkout.url,
    provider_ref: checkout.tokenId,
    expires_at: checkout.expiresAt,
    amount_idr: deps.amountIdr,
  });
  return { url: checkout.url };
}
