import { verifySignature } from "./doku-signature";

export type NotificationDeps = {
  secret: string;
  /** Our DOKU Client-Id; notifications carrying any other id are rejected. */
  clientId: string;
  findPaymentByInvoice(
    invoiceNumber: string,
  ): Promise<{ id: string; status: string; amount_cents: number } | null>;
  getOrderStatus(invoiceNumber: string): Promise<{ status: string; amount: number }>;
  markPaid(paymentId: string): Promise<void>;
  log(msg: string, extra?: Record<string, unknown>): void;
};

export type NotificationResult = { status: 200 | 401; body: string };

const ok = (body: string): NotificationResult => ({ status: 200, body });

type NotificationBody = { invoice: string | undefined; status: string | undefined };

function parseBody(rawBody: string): NotificationBody | null {
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return null;
  }
  if (json === null || typeof json !== "object") return null;
  const { order, transaction } = json as {
    order?: { invoice_number?: unknown };
    transaction?: { status?: unknown };
  };
  const invoice = order?.invoice_number;
  const status = transaction?.status;
  return {
    invoice: typeof invoice === "string" && invoice !== "" ? invoice : undefined,
    status: typeof status === "string" ? status : undefined,
  };
}

/**
 * Only an unauthenticated request gets a 401. Everything else is acknowledged with
 * 200 so DOKU stops retrying; anything we could not confirm is logged and left for
 * a later retry or a manual sync.
 */
export async function handleDokuNotification(
  deps: NotificationDeps,
  req: { headers: Headers; rawBody: string; target: string },
): Promise<NotificationResult> {
  if (
    !verifySignature(req.headers, req.rawBody, req.target, deps.secret) ||
    req.headers.get("Client-Id") !== deps.clientId
  ) {
    return { status: 401, body: "invalid signature" };
  }

  const parsed = parseBody(req.rawBody);
  if (!parsed) {
    deps.log("doku notification: body is not JSON");
    return ok("ignored");
  }
  if (parsed.status !== "SUCCESS") return ok("ignored");
  const invoice = parsed.invoice;
  if (!invoice) {
    deps.log("doku notification: missing order.invoice_number");
    return ok("ignored");
  }

  try {
    const payment = await deps.findPaymentByInvoice(invoice);
    if (!payment) {
      deps.log("doku notification: unknown invoice", { invoice });
      return ok("ignored");
    }
    if (payment.status === "paid") return ok("ok");

    const order = await deps.getOrderStatus(invoice);
    if (order.status !== "SUCCESS" || payment.amount_cents / 100 !== order.amount) {
      deps.log("doku notification: status check did not confirm payment", {
        invoice,
        status: order.status,
        amount: order.amount,
        expectedAmount: payment.amount_cents / 100,
      });
      return ok("ignored");
    }

    await deps.markPaid(payment.id);
    return ok("ok");
  } catch (err) {
    deps.log("doku notification: processing failed", {
      invoice,
      error: err instanceof Error ? err.message : String(err),
    });
    return ok("error");
  }
}
