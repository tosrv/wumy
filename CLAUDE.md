# CLAUDE.md

Panduan untuk Claude Code saat bekerja di repo ini. Detail produk, env vars, Supabase, dan DOKU ada di [`README.md`](README.md), jadi baca itu dulu bila perlu.

## Ringkasan proyek

WUMY: undangan pernikahan digital (situs publik, pesanan + pembayaran DOKU, editor, halaman undangan `/<slug>`).

Stack: TanStack Start (React, SSR, Vite, Nitro → Vercel), Supabase (Postgres, Auth, Storage), DOKU Checkout, PostHog (opsional), Tailwind + shadcn/ui (Radix), ikon `lucide-react`.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm install` | Pasang dependensi (Node.js 22+) |
| `npm run dev` | Dev server |
| `npm run build` | Build produksi |
| `npm test` | Vitest (`src/**/*.test.ts`) |
| `npm run lint` | ESLint + Prettier |
| `npx tsc --noEmit` | Cek tipe |

Sebelum commit, jalankan minimal `npx tsc --noEmit` dan `npm test`. Pastikan tidak ada error lint baru dari file yang diubah. Beberapa file lama masih punya error format Prettier; jangan format ulang seluruh file kecuali diminta.

## Struktur

- `src/routes/`: routing berbasis file TanStack Start (lihat `src/routes/README.md`). `src/routeTree.gen.ts` dibuat otomatis, jangan diedit manual.
  - `_site/`: halaman publik (login, FAQ, legal, reset password, dll).
  - `dashboard.*`, `editor.*`, `order.tsx`, `payment.status.tsx`: area pengguna.
  - `$slug.tsx`: halaman undangan publik.
  - `api/webhooks/doku.ts`: webhook pembayaran DOKU.
- `src/components/`: `ui/` (shadcn + komponen bersama, mis. `password-input.tsx`), `site/`, `dashboard/`, `editor/`, `invitations/`, `order/`, `payments/`.
- `src/lib/`: logika bersama + unit test (`*.test.ts` di sebelah file sumbernya).
- `src/server/`: kode server saja (pembayaran, staging gate, meta share).
- `src/templates/`, `src/data/templates.ts`: template undangan.
- `supabase/schema.sql`: skema lengkap (tabel, RLS, trigger, fungsi, storage). `supabase/dev/`: skrip khusus development.

## Konvensi kode

- TypeScript, impor alias `@/` → `src/`.
- Prettier: lebar 100, titik koma, kutip ganda, trailing comma.
- Teks UI untuk pengguna memakai Bahasa Indonesia (kecuali dashboard yang sudah berbahasa Inggris, ikuti teks di sekitarnya).
- Pakai ulang komponen di `src/components/ui/` sebelum membuat yang baru. Untuk kolom kata sandi, pakai `PasswordInput`.
- Rahasia (`SUPABASE_SERVICE_ROLE_KEY`, `DOKU_SECRET_KEY`, `STAGING_PASSWORD`) hanya di server dan jangan pernah diberi awalan `VITE_`.
- Status pembayaran hanya diubah server (`mark_invitation_paid`). Jangan melonggarkan aturan RLS/pembayaran di `schema.sql`.
- Daftar slug terlarang di `src/lib/slug.ts` (`RESERVED_SLUGS`) harus sinkron dengan database; perbarui keduanya bila menambah route tingkat atas.

## Branch dan alur kerja Git

- `main`: produksi. `dev`: staging (`dev.wumy.my.id`, Supabase dev, DOKU sandbox).
- Kerjakan perubahan di branch baru dari `dev`, dengan nama seperti `fix/...`, `feat/...`, `docs/...`, `chore/...`.
- Pesan commit memakai Conventional Commits, mis. `fix(auth): ...`, `feat(staging): ...`.
- Buka PR ke `dev`, jangan push langsung ke `dev` atau `main`.

### Setelah PR di-merge

Selalu lakukan langkah ini supaya branch lokal sama dengan GitHub:

```bash
git checkout dev
git pull origin dev
git branch -d <branch-yang-sudah-di-merge>
git fetch --prune origin
```

Jika branch remote belum terhapus otomatis oleh GitHub, hapus juga: `git push origin --delete <branch>`.
