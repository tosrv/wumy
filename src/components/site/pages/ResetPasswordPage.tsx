import { useEffect, useState, type FormEvent } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { newPasswordIssue } from "@/lib/password";
import { PasswordInput } from "@/components/ui/password-input";

const inputClass =
  "h-12 rounded-2xl border border-border-subtle bg-surface-canvas px-4 font-body-md text-body-md text-charcoal outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-charcoal/20";

/** How long to wait for Supabase to turn the email link into a session. */
const LINK_TIMEOUT_MS = 6000;

type Phase = "checking" | "ready" | "invalid";

/** Landing page of the reset email: Supabase reads the token from the URL (detectSessionInUrl). */
export function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setPhase("invalid");
      return;
    }
    // An error in the link (expired / already used) is reported in the URL.
    const params = new URLSearchParams(
      `${window.location.search.slice(1)}&${window.location.hash.slice(1)}`,
    );
    if (params.get("error") || params.get("error_code")) {
      setPhase("invalid");
      return;
    }

    let settled = false;
    const ready = () => {
      settled = true;
      setPhase("ready");
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) ready();
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) ready();
    });
    const timer = window.setTimeout(() => {
      if (!settled) setPhase("invalid");
    }, LINK_TIMEOUT_MS);
    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const issue = newPasswordIssue(password, confirm);
    if (issue) {
      setError(issue);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("Gagal menyimpan kata sandi. Minta link baru lalu coba lagi.");
        return;
      }
      void router.navigate({ to: "/dashboard", replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="w-full bg-surface-canvas pt-20">
      <div className="mx-auto max-w-[480px] px-margin py-space-2xl">
        <div className="rounded-3xl bg-surface-card p-space-lg shadow-sm md:p-space-xl">
          <h1 className="font-headline-lg text-headline-lg tracking-tight text-charcoal">
            Buat kata sandi baru
          </h1>
          {phase === "checking" && (
            <p className="mt-4 font-body-md text-body-md text-text-muted">Memeriksa link…</p>
          )}
          {phase === "invalid" && (
            <div className="mt-4 flex flex-col gap-4">
              <p className="rounded-2xl bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container">
                Link sudah tidak berlaku atau sudah dipakai.
              </p>
              <Link
                to="/forgot-password"
                className="self-start rounded-full bg-electric-lime px-7 py-3.5 font-label-btn text-label-btn text-charcoal"
              >
                Minta link baru
              </Link>
            </div>
          )}
          {phase === "ready" && (
            <form onSubmit={(e) => void onSubmit(e)} className="mt-6 flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="font-body-sm text-body-sm font-semibold text-charcoal">
                  Kata sandi baru
                </span>
                <PasswordInput
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-body-sm text-body-sm font-semibold text-charcoal">
                  Ulangi kata sandi
                </span>
                <PasswordInput
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                {busy ? "Menyimpan…" : "Simpan kata sandi"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
