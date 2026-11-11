import { randomUUID } from "node:crypto";
import type { PaymentConfig } from "./config";
import { buildDigest, buildSignature, dokuTimestamp } from "./doku-signature";

export class DokuError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "DokuError";
    this.status = status;
  }
}

export type CheckoutInput = {
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  callbackUrl: string;
  dueMinutes: number;
};

export type DokuDeps = {
  fetch?: typeof fetch;
  now?: () => Date;
  uuid?: () => string;
};

const CHECKOUT_PATH = "/checkout/v1/payment";
const STATUS_PATH = "/orders/v1/status/";

/**
 * Parses DOKU's `yyyyMMddHHmmss` expired_date. Per DOKU's backend-integration
 * doc this value is UTC+7 (WIB), so 7 hours are subtracted to get the real instant.
 */
function parseExpiredDate(raw: string): Date {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(raw);
  if (!m) throw new Error(`Unexpected DOKU expired_date: ${raw}`);
  const [y, mo, d, h, mi, s] = m.slice(1).map(Number) as [
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  return new Date(Date.UTC(y, mo - 1, d, h, mi, s) - 7 * 60 * 60 * 1000);
}

function text(v: unknown): string | undefined {
  if (typeof v === "string" && v) return v;
  if (Array.isArray(v)) {
    const joined = v.filter((x) => typeof x === "string").join("; ");
    return joined || undefined;
  }
  return undefined;
}

async function failure(res: Response): Promise<DokuError> {
  let message: string | undefined;
  try {
    const body = (await res.json()) as {
      message?: unknown;
      error?: unknown;
    };
    const err = body?.error;
    message =
      text(body?.message) ?? text((err as { message?: unknown } | undefined)?.message) ?? text(err);
  } catch {
    // non-JSON body: fall through to status text
  }
  return new DokuError(res.status, message ?? (res.statusText || `HTTP ${res.status}`));
}

export async function createCheckout(
  cfg: PaymentConfig,
  input: CheckoutInput,
  deps: DokuDeps = {},
): Promise<{ url: string; tokenId: string; expiresAt: Date }> {
  const doFetch = deps.fetch ?? fetch;
  const requestId = (deps.uuid ?? randomUUID)();
  const timestamp = dokuTimestamp((deps.now ?? (() => new Date()))());

  // Serialized once: the same exact string is digested and sent.
  const body = JSON.stringify({
    order: {
      amount: input.amount,
      invoice_number: input.invoiceNumber,
      callback_url: input.callbackUrl,
      callback_url_result: input.callbackUrl,
      auto_redirect: true,
    },
    payment: { payment_due_date: input.dueMinutes },
    customer: { name: input.customerName, email: input.customerEmail },
  });

  const signature = buildSignature(
    {
      clientId: cfg.dokuClientId,
      requestId,
      timestamp,
      target: CHECKOUT_PATH,
      digest: buildDigest(body),
    },
    cfg.dokuSecretKey,
  );

  const res = await doFetch(`${cfg.dokuApiBase}${CHECKOUT_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Id": cfg.dokuClientId,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
      Signature: signature,
    },
    body,
  });
  if (!res.ok) throw await failure(res);

  const json = (await res.json()) as {
    response?: { payment?: { url?: string; token_id?: string; expired_date?: string } };
  };
  const p = json.response?.payment;
  if (!p?.url || !p.token_id || !p.expired_date) {
    throw new DokuError(res.status, "DOKU checkout response missing payment fields");
  }
  return { url: p.url, tokenId: p.token_id, expiresAt: parseExpiredDate(p.expired_date) };
}

export async function getOrderStatus(
  cfg: PaymentConfig,
  invoiceNumber: string,
  deps: DokuDeps = {},
): Promise<{ status: string; amount: number }> {
  const doFetch = deps.fetch ?? fetch;
  const requestId = (deps.uuid ?? randomUUID)();
  const timestamp = dokuTimestamp((deps.now ?? (() => new Date()))());
  const target = `${STATUS_PATH}${encodeURIComponent(invoiceNumber)}`;

  const signature = buildSignature(
    { clientId: cfg.dokuClientId, requestId, timestamp, target },
    cfg.dokuSecretKey,
  );

  const res = await doFetch(`${cfg.dokuApiBase}${target}`, {
    method: "GET",
    headers: {
      "Client-Id": cfg.dokuClientId,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
      Signature: signature,
    },
  });
  if (!res.ok) throw await failure(res);

  // Shape per DOKU Check Status doc: top-level `transaction.status` and `order.amount`.
  const json = (await res.json()) as {
    transaction?: { status?: string };
    order?: { amount?: number | string };
  };
  const status = json.transaction?.status;
  const rawAmount = json.order?.amount;
  // DOKU's notification tables list order.amount as a string; accept either form.
  const amount =
    typeof rawAmount === "number" || (typeof rawAmount === "string" && rawAmount.trim() !== "")
      ? Number(rawAmount)
      : NaN;
  if (typeof status !== "string" || !Number.isFinite(amount)) {
    throw new DokuError(
      res.status,
      "DOKU status response missing transaction.status or a numeric order.amount",
    );
  }
  return { status, amount };
}
