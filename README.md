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
3. **Authentication → Providers** → enable **Email**. Under **Password requirements**, set minimum length **8** and require **lowercase, uppercase, digits and symbols**, so the server enforces the same strong-password rules as the app (`src/lib/password.ts`).
4. **Authentication → URL Configuration → Redirect URLs** → add `https://<domain>/reset-password` (and `http://localhost:5173/reset-password` for local).
5. Optional: translate the *Reset Password* email template (keep `{{ .ConfirmationURL }}`).
6. Google sign-in:
   - In Google Cloud Console → APIs & Services → Credentials, create an **OAuth client ID** (Web application) with the Supabase callback URL `https://<project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI.
   - **Authentication → Providers → Google** → enable it and paste the Client ID and Client Secret.
   - **Authentication → URL Configuration → Redirect URLs** → add `https://<domain>/login**` (and `http://localhost:5173/login**` for local). The `**` lets the `?next=` query through.
7. CAPTCHA (Cloudflare Turnstile):
   - In the Cloudflare dashboard → **Turnstile** → add a widget (Managed mode) for your domains (e.g. `wumy.my.id`, `dev.wumy.my.id`, `localhost`). Copy the **Site Key** and **Secret Key**.
   - **Authentication → Attack Protection** → enable **CAPTCHA protection**, choose **Turnstile**, and paste the Secret Key.
   - Set `VITE_TURNSTILE_SITE_KEY` to the Site Key and redeploy. Set it before (or together with) enabling CAPTCHA in Supabase: once Supabase requires CAPTCHA, email login, sign-up, and password reset fail without a token.

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
| `VITE_STORAGE_PUBLIC_URL` | no | Public URL of the Cloudflare R2 bucket, e.g. `https://media.wumy.my.id`. Set = photos and music use R2; empty = Supabase Storage |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | with R2 | Cloudflare R2 API token and bucket; **secret**, server only. Also needs `SUPABASE_SERVICE_ROLE_KEY` |
| `VITE_TURNSTILE_SITE_KEY` | no | Cloudflare Turnstile site key (public). Empty = no CAPTCHA widget. Must be set if Supabase CAPTCHA protection is on |

Never give secret variables a `VITE_` prefix. Redeploy on Vercel after changing env vars. Without a complete DOKU configuration, `/order` shows "Pembayaran online segera hadir" ("Online payment coming soon").

## File storage (Cloudflare R2 in production)

Invitation photos and music are stored in **Supabase Storage** by default (dev, local). Production uses **Cloudflare R2** when `VITE_STORAGE_PUBLIC_URL` is set. Both use the same buckets and paths (`{owner_id}/{invitation_id}/{file}`); in R2 everything lives in one bucket under the prefixes `invitation-photos/` and `invitation-music/`.

With R2, the browser never gets R2 credentials. It asks a server function (`src/server/storage/functions.ts`) for a presigned upload URL; the server checks the Supabase session, that the path belongs to the caller's own invitation (same rule as the Supabase storage policies), and the file type and size limits (`src/lib/storage-rules.ts`). Deletes and listing go through server functions with the same checks.

Setup:
1. Cloudflare → **R2** → create a bucket (e.g. `wumy-media`).
2. Bucket → **Settings → Custom Domains** → connect `media.wumy.my.id` (the zone must be on Cloudflare). This makes objects publicly readable and cached.
3. Bucket → **Settings → CORS policy** → allow uploads from the site:
   ```json
   [
     {
       "AllowedOrigins": ["https://www.wumy.my.id", "https://wumy.my.id"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type", "Cache-Control"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. R2 → **Manage API tokens** → create a token with **Object Read & Write** on that bucket. Note the Access Key ID, Secret Access Key, and your Account ID.
5. Vercel (Production env): set `VITE_STORAGE_PUBLIC_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `SUPABASE_SERVICE_ROLE_KEY`, then redeploy.

Files already uploaded to Supabase Storage are not moved; switching a project to R2 is meant for one with no stored files yet.

## Staging (`dev.wumy.my.id`)

The `dev` branch is deployed as a Vercel **Preview** on the `dev.wumy.my.id` domain, with a separate **dev** Supabase project and DOKU **sandbox**. Preview env vars (branch `dev`):

| Variable | Value |
| --- | --- |
| `STAGING_PASSWORD` | Staging lock password (server only). Login: user `wumy` + this password. Empty = not locked |
| `VITE_APP_ENV` | `staging` → "Staging" label in the corner of the screen |
| `VITE_SITE_URL` | `https://dev.wumy.my.id` |
| Supabase / DOKU | dev project and sandbox keys (`DOKU_API_BASE=https://api-sandbox.doku.com`) |

The staging lock (`src/server/staging/gate.ts`) requires Basic Auth on every page except `POST /api/webhooks/doku` (protected by the DOKU signature), and adds `X-Robots-Tag: noindex`. Production is unaffected because it has no `STAGING_PASSWORD`. Turn off Vercel Deployment Protection for Preview so DOKU sandbox webhooks can get through.

## Admin (`/admin`)

Admins can list invitations and payments, mark an invitation as paid without a DOKU payment (a free invitation, or a missed webhook), and see the activity log.

- Admins are stored in `public.admin_users`. That table, and `public.admin_audit_log`, have RLS on with no policies, so only the server (service role) can read them.
- Add an admin in the Supabase **SQL Editor** of each project (the user must have signed up first):
  ```sql
  insert into public.admin_users (user_id)
  select id from auth.users where email = 'you@example.com';
  ```
  Remove one with `delete from public.admin_users where user_id = '<uuid>';`.
- Every admin action goes through a server function (`src/server/admin/`) that checks the session and `admin_users` first. Non-admins and signed-out visitors get the normal 404 page.
- **Mark as paid** records a Rp0 `manual` payment and runs `mark_invitation_paid` (the same path as the DOKU webhook). It does not publish; the owner still presses **Terbitkan**. A reason is required and written to the activity log.
- Requires `SUPABASE_SERVICE_ROLE_KEY` on the server.

## Payments (DOKU Checkout)

- `/order` calls the `createPublishCheckout` server function → DOKU page → back to `/payment/status?invoice=…`.
- DOKU sends notifications to `POST /api/webhooks/doku`: the HMAC signature is verified, status and amount are re-checked with DOKU, then `mark_invitation_paid` runs (idempotent). Paying does not publish the invitation; the owner presses **Terbitkan** ("Publish") in the editor.
- **DOKU Back Office** → Payment Settings → each active method (not the SNAP version) → Notification URL: `https://<domain>/api/webhooks/doku`.
- Quick check: `curl -i -X POST https://<domain>/api/webhooks/doku -d '{}'` → `503` = env incomplete, `401` = ready.
- Sandbox test: sign up → `/order` → Bayar ("Pay") → pay with the DOKU **Simulator** → "Mulai isi undangan" ("Start filling in the invitation") → fill it in → **Terbitkan** → open `/<slug>`.
- Refunds are processed manually (DOKU Back Office); the policy is at `/refund`.

## Analytics (PostHog, optional)

Events: `demo_view` → `order_view` → `signup` → `checkout_start` → `paid` → `editor_open` → `published` (+ page views). Public invitation pages don't load PostHog; URLs are stripped of query strings, slugs, and ids before being sent. Code: `src/lib/analytics.ts`.
