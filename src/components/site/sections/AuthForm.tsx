import { track } from "@/lib/analytics";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { isSafeNextPath } from "@/lib/safe-redirect";
import { PasswordInput } from "@/components/ui/password-input";

type Mode = "login" | "signup";

interface AuthFormProps {
  initialMode?: Mode;
  nextPath?: string;
}

export function AuthForm({ initialMode = "login", nextPath = "/dashboard" }: AuthFormProps) {
  const { configured, signIn, signUp, user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function goNext() {
    const target = isSafeNextPath(nextPath) ? nextPath : "/dashboard";
    void router.navigate({ href: target });
  }

  useEffect(() => {
    if (!loading && user) {
      goNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only redirect on auth settle
  }, [loading, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          return;
        }
        goNext();
        return;
      }

      const result = await signUp(email, password, fullName.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      track("signup");
      setInfo("Akun berhasil dibuat. Jika diminta, buka email untuk konfirmasi, lalu masuk.");
      setMode("login");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1240px] gap-space-lg px-margin py-space-xl md:px-margin-tablet md:py-space-2xl lg:px-margin-desktop lg:grid-cols-[1fr_1.05fr]">
      <div className="rounded-[2rem] bg-charcoal px-6 py-12 text-white md:px-10 md:py-16">
        <p className="mb-4 font-label-eyebrow text-label-eyebrow uppercase tracking-widest text-electric-lime">
          {mode === "login" ? "Selamat datang kembali" : "Buat akun"}
        </p>
        <h1 className="font-headline-xl text-headline-xl tracking-tight text-white md:text-headline-hero md:leading-[0.96]">
          {mode === "login" ? "Masuk ke WUMY." : "Buat akunmu."}
        </h1>
        <p className="mt-6 max-w-md font-body-md text-body-md leading-relaxed text-white/70 md:text-body-lg">
          Save drafts, pick a template, and publish when you&apos;re ready — all in one place.
        </p>
      </div>

      <div className="rounded-[2rem] border border-border-subtle bg-surface-card px-6 py-10 shadow-sm md:px-10 md:py-12">
        {!configured && (
          <div className="mb-6 rounded-2xl border border-border-subtle bg-surface-container px-4 py-3 font-body-sm text-body-sm text-text-muted">
            Supabase belum dikonfigurasi. Tambahkan{" "}
            <code className="text-charcoal">VITE_SUPABASE_URL</code> dan{" "}
            <code className="text-charcoal">VITE_SUPABASE_ANON_KEY</code> di{" "}
            <code className="text-charcoal">.env</code>, lalu jalankan{" "}
            <code className="text-charcoal">supabase/schema.sql</code>
            .
          </div>
        )}

        <div className="mb-8 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setInfo(null);
            }}
            className={`rounded-full px-4 py-2 font-label-btn text-label-btn transition-colors ${
              mode === "login"
                ? "bg-charcoal text-white"
                : "bg-surface-container text-charcoal hover:bg-surface-container-high"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setInfo(null);
            }}
            className={`rounded-full px-4 py-2 font-label-btn text-label-btn transition-colors ${
              mode === "signup"
                ? "bg-charcoal text-white"
                : "bg-surface-container text-charcoal hover:bg-surface-container-high"
            }`}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === "signup" && (
            <label className="flex flex-col gap-2">
              <span className="font-body-sm text-body-sm font-semibold text-charcoal">
                Nama lengkap
              </span>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Andi & Sinta"
                className="h-12 rounded-2xl border border-border-subtle bg-surface-canvas px-4 font-body-md text-body-md text-charcoal outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-charcoal/20"
              />
            </label>
          )}

          <label className="flex flex-col gap-2">
            <span className="font-body-sm text-body-sm font-semibold text-charcoal">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="h-12 rounded-2xl border border-border-subtle bg-surface-canvas px-4 font-body-md text-body-md text-charcoal outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-charcoal/20"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-body-sm text-body-sm font-semibold text-charcoal">
              Kata sandi
            </span>
            <PasswordInput
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="h-12 rounded-2xl border border-border-subtle bg-surface-canvas px-4 font-body-md text-body-md text-charcoal outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-charcoal/20"
            />
            {mode === "login" && (
              <Link
                to="/forgot-password"
                className="self-end font-body-sm text-body-sm font-semibold text-charcoal underline-offset-2 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            )}
          </label>

          {error && (
            <p className="rounded-2xl bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-2xl bg-electric-lime/40 px-4 py-3 font-body-sm text-body-sm text-charcoal">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !configured}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-electric-lime px-7 py-3.5 font-label-btn text-label-btn text-charcoal transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Tunggu sebentar…" : mode === "login" ? "Masuk" : "Buat akun"}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="mt-8 font-body-sm text-body-sm text-text-muted">
          Mau lihat-lihat dulu?{" "}
          <Link
            to="/product"
            className="font-semibold text-charcoal transition-colors hover:text-text-muted"
          >
            Lihat template
          </Link>
        </p>
      </div>
    </div>
  );
}
