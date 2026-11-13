import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, KeyRound, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getProfileName } from "@/lib/display-name";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordRequirements } from "@/components/ui/password-requirements";
import { newPasswordIssue } from "@/lib/password";
import { fieldClass } from "@/components/ui/field-styles";
import { cn } from "@/lib/utils";

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
    setFullName(getProfileName(user));
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
      const name = fullName.trim();
      // `display_name`, not `full_name`: Google overwrites `full_name` on every sign-in.
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { display_name: name },
      });
      if (updateError) throw updateError;
      // Keep profiles.full_name (used e.g. as the payer name) in sync.
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: name || null })
          .eq("id", data.user.id);
        if (profileError) throw profileError;
      }
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
    const issue = newPasswordIssue(password, confirmPassword, "en");
    if (issue) {
      setError(issue);
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
      setError(err instanceof Error ? err.message : "Failed to update password.");
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
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
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
                className={cn(fieldClass, "h-10")}
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
                  className={cn(fieldClass, "h-10 pl-9 text-text-muted")}
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
                placeholder="Create a strong password"
                className={cn(fieldClass, "h-10")}
              />
              <PasswordRequirements password={password} lang="en" className="mt-2" />
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
                className={cn(fieldClass, "h-10")}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
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
          <p className="mt-1 text-sm text-muted-foreground">Jump to related account pages.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-10 rounded-xl">
              <Link to="/dashboard/billing">Billing</Link>
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-xl">
              <Link to="/dashboard/help">Help / Support</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
