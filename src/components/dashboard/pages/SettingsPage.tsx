import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, KeyRound, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function SettingsPage() {
  const { user, configured } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(
      (user.user_metadata?.["full_name"] as string | undefined)?.trim() || "",
    );
    setEmail(user.email ?? "");
  }, [user]);

  async function saveProfile() {
    setError(null);
    setProfileMessage(null);
    if (!configured) {
      setError("Supabase is not configured.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setSavingProfile(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });
      if (updateError) throw updateError;
      setProfileMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    setError(null);
    setPasswordMessage(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }
    if (!configured) {
      setError("Supabase is not configured.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setSavingPassword(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 pb-16 md:px-8 md:py-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Settings
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Manage your profile, email, and password for this WUMY account.
          </p>
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <section className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Display name
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="h-10 rounded-xl bg-secondary/70"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={email}
                  readOnly
                  className="h-10 rounded-xl bg-secondary/70 pl-9 text-muted-foreground"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Email changes are handled via support for now.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="h-10 rounded-xl bg-accent font-bold text-accent-foreground hover:bg-accent/90"
              disabled={savingProfile}
              onClick={() => void saveProfile()}
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </Button>
            {profileMessage && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.45_0.1_160)]">
                <Check className="size-3.5" />
                {profileMessage}
              </span>
            )}
          </div>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">Password</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                New password
              </Label>
              <PasswordInput
                styled
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-10 rounded-xl bg-secondary/70"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Confirm password
              </Label>
              <PasswordInput
                styled
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="h-10 rounded-xl bg-secondary/70"
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl bg-card shadow-sm"
              disabled={savingPassword}
              onClick={() => void savePassword()}
            >
              {savingPassword ? "Updating…" : "Update password"}
            </Button>
            {passwordMessage && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.45_0.1_160)]">
                <Check className="size-3.5" />
                {passwordMessage}
              </span>
            )}
          </div>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Quick links</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump to related account pages.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl bg-card shadow-sm"
            >
              <Link to="/dashboard/billing">Billing</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl bg-card shadow-sm"
            >
              <Link to="/dashboard/help">Help / Support</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
