# CLAUDE.md

Guidance for Claude Code when working in this repository. Product details, env vars, Supabase, and DOKU setup live in [`README.md`](README.md); read it when needed.

## Language

- **English** for everything developer-facing: commit messages, branch names, PR titles and descriptions, review replies, docs (including this file), and code comments.
- **Bahasa Indonesia** only for user-facing app text (UI copy, labels, toasts, error messages shown to users, emails). Match the surrounding copy: some dashboard pages are already in English.

## Project overview

WUMY: digital wedding invitations (public site, ordering + DOKU payments, editor, public invitation page at `/<slug>`).

Stack: TanStack Start (React, SSR, Vite, Nitro → Vercel), Supabase (Postgres, Auth, Storage), DOKU Checkout, PostHog (optional), Tailwind + shadcn/ui (Radix), `lucide-react` icons.

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies (Node.js 22+) |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Vitest (`src/**/*.test.ts`) |
| `npm run lint` | ESLint + Prettier |
| `npx tsc --noEmit` | Type check |

Before committing, run `npx tsc --noEmit`, `npm test`, and `npm run lint` (0 errors; `npm run format` fixes Prettier issues). CI (`.github/workflows/ci.yml`) runs the same three checks on every PR and push to `dev`/`main`.

## Structure

- `src/routes/`: TanStack Start file-based routing (see `src/routes/README.md`). `src/routeTree.gen.ts` is generated; never edit it by hand.
  - `_site/`: public pages (login, FAQ, legal, reset password, etc.).
  - `dashboard.*`, `editor.*`, `order.tsx`, `payment.status.tsx`: signed-in area.
  - `$slug.tsx`: public invitation page.
  - `api/webhooks/doku.ts`: DOKU payment webhook.
- `src/components/`: `ui/` (shadcn + shared components, e.g. `password-input.tsx`), `site/`, `dashboard/`, `editor/`, `invitations/`, `order/`, `payments/`.
- `src/lib/`: shared logic + unit tests (`*.test.ts` next to the source file).
- `src/server/`: server-only code (payments, R2 storage, staging gate, security headers, share meta). `src/server.ts` wraps every response with `withSecurityHeaders`; if a new feature needs to be framed or use camera/mic/location, update `src/server/security-headers.ts`.
- Storage: always go through `src/lib/storage.ts` (Supabase Storage or Cloudflare R2, picked by `VITE_STORAGE_PUBLIC_URL`); bucket limits and path rules live in `src/lib/storage-rules.ts`.
- `src/templates/`, `src/data/templates.ts`: invitation templates.
- `supabase/schema.sql`: full schema (tables, RLS, triggers, functions, storage). `supabase/dev/`: development-only scripts.

## Code conventions

- TypeScript; `@/` import alias → `src/`.
- Prettier: width 100, semicolons, double quotes, trailing commas.
- Reuse components in `src/components/ui/` before adding new ones. Use `PasswordInput` for password fields.
- Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `DOKU_SECRET_KEY`, `R2_SECRET_ACCESS_KEY`, `R2_ACCESS_KEY_ID`, `STAGING_PASSWORD`) are server-only and must never get a `VITE_` prefix.
- Payment status is changed only on the server (`mark_invitation_paid`). Don't loosen RLS or payment rules in `schema.sql`.
- Reserved slugs in `src/lib/slug.ts` (`RESERVED_SLUGS`) must stay in sync with the database; update both when adding a top-level route.

## Branches and Git workflow

- `main`: production. `dev`: staging (`dev.wumy.my.id`, dev Supabase, DOKU sandbox).
- Work on a new branch off `dev`, named like `fix/...`, `feat/...`, `docs/...`, `chore/...`.
- Use Conventional Commits, e.g. `fix(auth): ...`, `feat(staging): ...`.
- Open PRs against `dev`; don't push directly to `dev` or `main`.

### After a PR is merged

Always run these steps so local branches match GitHub:

```bash
git checkout dev
git pull origin dev
git branch -d <merged-branch>
git fetch --prune origin
```

If GitHub didn't delete the remote branch automatically, delete it too: `git push origin --delete <branch>`.
