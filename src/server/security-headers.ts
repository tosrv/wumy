/**
 * Security headers added to every response served by the app server (pages, server
 * functions, API routes). Static assets are served by Vercel directly and don't need them.
 *
 * Deliberately no full Content-Security-Policy: PostHog, Turnstile, DOKU, and R2 would
 * each need allowlisting, and a mistake breaks pages. `frame-ancestors` is the one
 * directive that is safe on its own.
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  // Only ever load the site over HTTPS (2 years, subdomains included).
  "strict-transport-security": "max-age=63072000; includeSubDomains",
  // Nothing on the site is meant to be framed: blocks clickjacking on login/payment.
  "x-frame-options": "DENY",
  "content-security-policy": "frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  // Features the app never uses. Clipboard and Web Share stay allowed.
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

/** Returns `response` with the security headers set; headers it already has are kept. */
export function withSecurityHeaders(response: Response): Response {
  const missing = Object.entries(SECURITY_HEADERS).filter(([name]) => !response.headers.has(name));
  if (missing.length === 0) return response;
  const headers = new Headers(response.headers);
  for (const [name, value] of missing) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
