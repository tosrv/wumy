# WUMY

Digital wedding invitations: public site, ordering + DOKU payments, editor, and invitation pages at `/<slug>`.

**Stack:** TanStack Start (React, SSR) on Vercel · Supabase (Postgres, Auth, Storage) · DOKU Checkout · PostHog (optional).

**Customer flow:** template → demo → *Gunakan template ini* ("Use this template") → sign up/sign in → `/order` (pay) → editor → *Terbitkan* ("Publish") → share `/<slug>`.

## Running locally

Requires Node.js 22+.

```sh
npm install
cp .env.example .env   # fill in the Supabase values
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (Nitro → Vercel) |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

Public pages work without Supabase; login, `/order`, the dashboard, and the editor need Supabase.

## Supabase

1. Create a new project at supabase.com.
2. **SQL Editor** → run [`supabase/schema.sql`](supabase/schema.sql) once (full schema: tables, RLS, triggers, functions, storage bucket, template seed).
3. **Authentication → Providers** → enable **Email**.
4. **Authentication → URL Configuration → Redirect URLs** → add `https://<domain>/reset-password` (and `http://localhost:5173/reset-password` for local).
5. Optional: translate the *Reset Password* email template (keep `{{ .ConfirmationURL }}`).

Key rules enforced by the database:
- An invitation can only go live when `payment_status = 'paid'`; payment status is changed only by the server (`mark_invitation_paid`, service role).
- One invitation per account; slugs used by app routes are rejected (kept in sync with `RESERVED_SLUGS` in `src/lib/slug.ts`); a slug is locked once it has been published.

To skip payment in the **development** project, run [`supabase/dev/mark_paid.sql`](supabase/dev/mark_paid.sql) (replace the slug).

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | yes | Supabase → Project Settings → API |
| `VITE_SITE_URL` | yes (production) | Site domain, e.g. `https://www.wumy.my.id` (canonical/OG, DOKU return URL) |
| `SUPABASE_SERVICE_ROLE_KEY` | payments | **Secret**, server only |
| `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY` | payments | From DOKU Back Office; the Secret Key is **secret** |
| `DOKU_API_BASE` | payments | `https://api-sandbox.doku.com` or `https://api.doku.com` |
| `PUBLISH_PRICE_IDR` | no | Override the price (rupiah, ≥ 1000). Default Rp 99,000 |
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | no | PostHog analytics; empty = disabled |

Never give secret variables a `VITE_` prefix. Redeploy on Vercel after changing env vars. Without a complete DOKU configuration, `/order` shows "Pembayaran online segera hadir" ("Online payment coming soon").

## Staging (`dev.wumy.my.id`)

The `dev` branch is deployed as a Vercel **Preview** on the `dev.wumy.my.id` domain, with a separate **dev** Supabase project and DOKU **sandbox**. Preview env vars (branch `dev`):

| Variable | Value |
| --- | --- |
| `STAGING_PASSWORD` | Staging lock password (server only). Login: user `wumy` + this password. Empty = not locked |
| `VITE_APP_ENV` | `staging` → "Staging" label in the corner of the screen |
| `VITE_SITE_URL` | `https://dev.wumy.my.id` |
| Supabase / DOKU | dev project and sandbox keys (`DOKU_API_BASE=https://api-sandbox.doku.com`) |

The staging lock (`src/server/staging/gate.ts`) requires Basic Auth on every page except `POST /api/webhooks/doku` (protected by the DOKU signature), and adds `X-Robots-Tag: noindex`. Production is unaffected because it has no `STAGING_PASSWORD`. Turn off Vercel Deployment Protection for Preview so DOKU sandbox webhooks can get through.

## Payments (DOKU Checkout)

- `/order` calls the `createPublishCheckout` server function → DOKU page → back to `/payment/status?invoice=…`.
- DOKU sends notifications to `POST /api/webhooks/doku`: the HMAC signature is verified, status and amount are re-checked with DOKU, then `mark_invitation_paid` runs (idempotent). Paying does not publish the invitation; the owner presses **Terbitkan** ("Publish") in the editor.
- **DOKU Back Office** → Payment Settings → each active method (not the SNAP version) → Notification URL: `https://<domain>/api/webhooks/doku`.
- Quick check: `curl -i -X POST https://<domain>/api/webhooks/doku -d '{}'` → `503` = env incomplete, `401` = ready.
- Sandbox test: sign up → `/order` → Bayar ("Pay") → pay with the DOKU **Simulator** → "Mulai isi undangan" ("Start filling in the invitation") → fill it in → **Terbitkan** → open `/<slug>`.
- Refunds are processed manually (DOKU Back Office); the policy is at `/refund`.

## Analytics (PostHog, optional)

Events: `demo_view` → `order_view` → `signup` → `checkout_start` → `paid` → `editor_open` → `published` (+ page views). Public invitation pages don't load PostHog; URLs are stripped of query strings, slugs, and ids before being sent. Code: `src/lib/analytics.ts`.
