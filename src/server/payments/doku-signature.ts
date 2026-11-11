import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type SignatureParts = {
  clientId: string;
  requestId: string;
  timestamp: string;
  target: string;
  /** Present for POST requests only. */
  digest?: string;
};

/** base64(SHA-256(raw body)). Must be computed over the exact raw bytes sent. */
export function buildDigest(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("base64");
}

/** `HMACSHA256=` + base64(HMAC-SHA256(secret, signature components)). */
export function buildSignature(p: SignatureParts, secret: string): string {
  const lines = [
    `Client-Id:${p.clientId}`,
    `Request-Id:${p.requestId}`,
    `Request-Timestamp:${p.timestamp}`,
    `Request-Target:${p.target}`,
  ];
  if (p.digest !== undefined) lines.push(`Digest:${p.digest}`);
  const mac = createHmac("sha256", secret).update(lines.join("\n"), "utf8");
  return `HMACSHA256=${mac.digest("base64")}`;
}

/** Verifies a DOKU HTTP notification (POST) against its raw body. */
export function verifySignature(
  headers: Headers,
  rawBody: string,
  target: string,
  secret: string,
): boolean {
  const clientId = headers.get("Client-Id");
  const requestId = headers.get("Request-Id");
  const timestamp = headers.get("Request-Timestamp");
  const signature = headers.get("Signature");
  if (!clientId || !requestId || !timestamp || !signature) return false;

  const expected = Buffer.from(
    buildSignature(
      { clientId, requestId, timestamp, target, digest: buildDigest(rawBody) },
      secret,
    ),
    "utf8",
  );
  const actual = Buffer.from(signature, "utf8");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

/** `YYYY-MM-DDTHH:mm:ssZ` in UTC, no milliseconds. */
export function dokuTimestamp(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}
