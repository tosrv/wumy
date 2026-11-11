import { createHash, timingSafeEqual } from "node:crypto";

/** Fixed username for the staging Basic Auth prompt. */
export const STAGING_USER = "wumy";

/** Paths that must stay reachable without the password (signed DOKU notifications). */
const EXEMPT_PATHS = new Set(["/api/webhooks/doku"]);

const digest = (s: string) => createHash("sha256").update(s).digest();

function safeEqual(a: string, b: string): boolean {
  // Hash first so lengths match and the comparison is constant-time.
  return timingSafeEqual(digest(a), digest(b));
}

function parseBasicAuth(header: string | null): { user: string; pass: string } | null {
  if (!header?.startsWith("Basic ")) return null;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return null;
  }
  const i = decoded.indexOf(":");
  if (i < 0) return null;
  return { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
}

/**
 * Staging lock. Returns a 401 Response when the request must be blocked, or null
 * to let it through. Disabled (always null) when `password` is empty, so production
 * — which has no STAGING_PASSWORD — is unaffected.
 */
export function stagingGate(request: Request, password: string | undefined): Response | null {
  const secret = password?.trim();
  if (!secret) return null;

  const { pathname } = new URL(request.url);
  if (EXEMPT_PATHS.has(pathname)) return null;

  const creds = parseBasicAuth(request.headers.get("authorization"));
  const ok = creds !== null && safeEqual(creds.user, STAGING_USER) && safeEqual(creds.pass, secret);
  if (ok) return null;

  return new Response("Staging WUMY — login diperlukan.", {
    status: 401,
    headers: {
      "www-authenticate": 'Basic realm="WUMY staging", charset="UTF-8"',
      "content-type": "text/plain; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "no-store",
    },
  });
}

/** Adds noindex to every response while the staging lock is enabled. */
export function withStagingHeaders(response: Response, password: string | undefined): Response {
  if (!password?.trim()) return response;
  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", "noindex, nofollow");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
