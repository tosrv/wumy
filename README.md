# WUMY

Undangan pernikahan digital: situs publik, pesanan + pembayaran DOKU, editor, dan halaman undangan `/<slug>`.

**Stack:** TanStack Start (React, SSR) di Vercel · Supabase (Postgres, Auth, Storage) · DOKU Checkout · PostHog (opsional).

**Alur pelanggan:** template → demo → *Gunakan template ini* → daftar/masuk → `/order` (bayar) → editor → *Terbitkan* → bagikan `/<slug>`.

## Menjalankan lokal

Butuh Node.js 22+.

```sh
npm install
cp .env.example .env   # isi nilai Supabase
npm run dev
```

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Build produksi (Nitro → Vercel) |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

Halaman publik jalan tanpa Supabase; login, `/order`, dashboard, dan editor butuh Supabase.

## Supabase

1. Buat project baru di supabase.com.
2. **SQL Editor** → jalankan [`supabase/schema.sql`](supabase/schema.sql) sekali (skema lengkap: tabel, RLS, trigger, fungsi, bucket storage, seed template).
3. **Authentication → Providers** → aktifkan **Email**.
4. **Authentication → URL Configuration → Redirect URLs** → tambahkan `https://<domain>/reset-password` (dan `http://localhost:5173/reset-password` untuk lokal).
5. Opsional: terjemahkan template email *Reset Password* (pertahankan `{{ .ConfirmationURL }}`).

Aturan penting yang dijaga database:
- Undangan hanya bisa tayang jika `payment_status = 'paid'`; status bayar hanya diubah server (`mark_invitation_paid`, service role).
- Satu undangan per akun; slug yang dipakai route aplikasi ditolak (sinkron dengan `RESERVED_SLUGS` di `src/lib/slug.ts`); slug dikunci setelah pernah tayang.

Lewati pembayaran di project **development**: jalankan [`supabase/dev/mark_paid.sql`](supabase/dev/mark_paid.sql) (ganti slug).

## Environment variables

| Variable | Wajib | Keterangan |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | ya | Supabase → Project Settings → API |
| `VITE_SITE_URL` | ya (produksi) | Domain situs, mis. `https://www.wumy.my.id` (canonical/OG, URL kembali DOKU) |
| `SUPABASE_SERVICE_ROLE_KEY` | pembayaran | **Rahasia**, server saja |
| `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY` | pembayaran | Dari DOKU Back Office; Secret Key **rahasia** |
| `DOKU_API_BASE` | pembayaran | `https://api-sandbox.doku.com` atau `https://api.doku.com` |
| `PUBLISH_PRICE_IDR` | tidak | Ganti harga (rupiah, ≥ 1000). Default Rp 99.000 |
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | tidak | Analitik PostHog; kosong = mati |

Variabel rahasia jangan pernah diberi awalan `VITE_`. Redeploy Vercel setelah mengubah env. Tanpa konfigurasi DOKU lengkap, `/order` menampilkan "Pembayaran online segera hadir".

## Pembayaran (DOKU Checkout)

- `/order` memanggil server function `createPublishCheckout` → halaman DOKU → kembali ke `/payment/status?invoice=…`.
- DOKU mengirim notifikasi ke `POST /api/webhooks/doku`: tanda tangan HMAC diverifikasi, status dan nominal dicek ulang ke DOKU, lalu `mark_invitation_paid` (idempoten). Pembayaran tidak menayangkan undangan; pemilik menekan **Terbitkan** di editor.
- **DOKU Back Office** → Payment Settings → tiap metode yang aktif (bukan versi SNAP) → Notification URL: `https://<domain>/api/webhooks/doku`.
- Cek cepat: `curl -i -X POST https://<domain>/api/webhooks/doku -d '{}'` → `503` = env belum lengkap, `401` = siap.
- Uji sandbox: daftar → `/order` → Bayar → bayar lewat **Simulator** DOKU → "Mulai isi undangan" → isi → **Terbitkan** → buka `/<slug>`.
- Refund diproses manual (DOKU Back Office); kebijakan di `/refund`.

## Analitik (PostHog, opsional)

Event: `demo_view` → `order_view` → `signup` → `checkout_start` → `paid` → `editor_open` → `published` (+ page view). Halaman undangan publik tidak memuat PostHog; URL dibersihkan dari query, slug, dan id sebelum dikirim. Kode: `src/lib/analytics.ts`.
