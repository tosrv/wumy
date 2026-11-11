import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { absoluteUrl } from "@/lib/seo";

const inputClass =
  "h-12 rounded-2xl border border-border-subtle bg-surface-canvas px-4 font-body-md text-body-md text-charcoal outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-charcoal/20";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Layanan login belum tersedia. Coba lagi nanti.");
      return;
    }
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: absoluteUrl("/reset-password"),
      });
      // Rate limits are worth showing; anything else gets the neutral message so
      // the page never reveals whether an email has an account.
      if (resetError && resetError.status === 429) {
        setError("Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.");
        return;
      }
      setSent(true);
    } catch {
      setError("Gagal mengirim. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="w-full bg-surface-canvas pt-20">
      <div className="mx-auto max-w-[480px] px-margin py-space-2xl">
        <div className="rounded-3xl bg-surface-card p-space-lg shadow-sm md:p-space-xl">
          <h1 className="font-headline-lg text-headline-lg tracking-tight text-charcoal">
            Lupa kata sandi
          </h1>
          {sent ? (
            <p className="mt-4 rounded-2xl bg-electric-lime/40 px-4 py-3 font-body-md text-body-md text-charcoal">
              Kalau email itu terdaftar, link untuk membuat kata sandi baru sudah kami kirim. Cek
              juga folder spam.
            </p>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="mt-6 flex flex-col gap-5">
              <p className="font-body-md text-body-md text-text-muted">
                Masukkan email akunmu. Kami akan mengirim link untuk membuat kata sandi baru.
              </p>
              <label className="flex flex-col gap-2">
                <span className="font-body-sm text-body-sm font-semibold text-charcoal">Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className={inputClass}
                />
              </label>
              {error && (
                <p className="rounded-2xl bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="self-start rounded-full bg-electric-lime px-7 py-3.5 font-label-btn text-label-btn text-charcoal disabled:opacity-50"
              >
                {busy ? "Mengirim…" : "Kirim link reset"}
              </button>
            </form>
          )}
          <p className="mt-6 font-body-sm text-body-sm text-text-muted">
            Ingat kata sandimu?{" "}
            <Link to="/login" className="font-semibold text-charcoal underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
