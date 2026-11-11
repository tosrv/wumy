/**
 * Product funnel analytics (PostHog). No-op unless VITE_POSTHOG_KEY is set.
 *
 * Privacy rules:
 * - Only events from the allowlist below, with allowlisted properties (no names,
 *   emails, invitation content).
 * - Page views are sent manually, only for site/app pages, with ids masked and
 *   no query string. Public invitations (/<slug>?to=Guest-Name) are never tracked.
 * - No autocapture, no session recording.
 */
import { isReservedSlug } from "@/lib/slug";

export type AnalyticsEvent =
  "demo_view" | "order_view" | "signup" | "checkout_start" | "paid" | "editor_open" | "published";

type Props = { template?: string; amount?: number; source?: string };

const ALLOWED_PROPS = ["template", "amount", "source"] as const;

type PostHogLike = {
  capture: (event: string, props?: Record<string, unknown>) => void;
};

let client: PostHogLike | null = null;
let loading: Promise<void> | null = null;
const queue: [string, Record<string, unknown>][] = [];

function config() {
  const key = (import.meta.env["VITE_POSTHOG_KEY"] as string | undefined)?.trim();
  const host =
    (import.meta.env["VITE_POSTHOG_HOST"] as string | undefined)?.trim() ||
    "https://us.i.posthog.com";
  return key ? { key, host } : null;
}

/** Keep only allowlisted properties with primitive values. */
export function sanitizeProps(props: Record<string, unknown> = {}): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of ALLOWED_PROPS) {
    const v = props[k];
    if (typeof v === "string" || typeof v === "number") out[k] = v;
  }
  return out;
}

/**
 * Path to record for a page view, or null when the page must not be tracked.
 * Tracks "/" and paths whose first segment is an app/site route; masks UUIDs.
 */
export function trackablePath(pathname: string): string | null {
  const path = pathname.split(/[?#]/)[0] || "/";
  if (path === "/") return "/";
  const first = path.split("/")[1] ?? "";
  if (!isReservedSlug(first)) return null;
  return path.replace(UUID_RE, ":id");
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * Strip query string and hash, mask ids, and hide invitation slugs from a URL or path.
 * Non-URL strings (e.g. "$direct") are returned unchanged.
 */
export function scrubUrl(value: string): string {
  const isPath = value.startsWith("/");
  if (!isPath && !/^https?:\/\//i.test(value)) return value;
  let url: URL;
  try {
    url = new URL(value, "https://x.invalid");
  } catch {
    return value;
  }
  const first = url.pathname.split("/")[1] ?? "";
  const path =
    url.pathname === "/" || isReservedSlug(first)
      ? url.pathname.replace(UUID_RE, ":id")
      : "/[invitation]";
  return isPath ? path : `${url.origin}${path}`;
}

const URL_KEY = /url|referrer|href|pathname/i;

function scrubProps(props: Record<string, unknown> | undefined) {
  if (!props) return;
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string" && URL_KEY.test(k)) props[k] = scrubUrl(v);
  }
}

/** PostHog before_send hook: scrub every URL-like property on every event. */
export function scrubCapture<
  T extends {
    properties: Record<string, unknown>;
    $set?: Record<string, unknown>;
    $set_once?: Record<string, unknown>;
  },
>(cr: T): T {
  scrubProps(cr.properties);
  scrubProps(cr.$set);
  scrubProps(cr.$set_once);
  return cr;
}

/** Load PostHog once in the browser (called by the first event). */
function initAnalytics(): void {
  if (typeof window === "undefined" || loading) return;
  const cfg = config();
  if (!cfg) return;
  loading = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(cfg.key, {
        api_host: cfg.host,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        person_profiles: "identified_only",
        before_send: (cr) => (cr ? scrubCapture(cr) : cr),
      });
      client = posthog;
      for (const [e, p] of queue.splice(0)) client.capture(e, p);
    })
    .catch(() => {
      // Blocked by an ad blocker or offline: analytics is optional.
    });
}

function send(event: string, props: Record<string, unknown>) {
  if (typeof window === "undefined" || !config()) return;
  if (client) client.capture(event, props);
  else {
    queue.push([event, props]);
    initAnalytics();
  }
}

export function track(event: AnalyticsEvent, props?: Props): void {
  send(event, sanitizeProps(props));
}

export function trackPageview(pathname: string): void {
  const path = trackablePath(pathname);
  if (!path) return;
  send("$pageview", { $current_url: `${window.location.origin}${path}`, $pathname: path });
}
