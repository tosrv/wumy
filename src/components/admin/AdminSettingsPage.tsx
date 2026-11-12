import { useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { newPasswordIssue } from "@/lib/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordRequirements } from "@/components/ui/password-requirements";

/** The signed-in admin's own account: email and password change. */
export function AdminSettingsPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function savePassword() {
    setError(null);
    setMessage(null);
    const issue = newPasswordIssue(password, confirm, "en");
    if (issue) {
      setError(issue);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword("");
      setConfirm("");
      setMessage("Password updated. Use it the next time you sign in.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && /reauthentication|recent/i.test(err.message)
          ? "For security, sign out and sign in again, then change your password."
          : "Failed to update the password. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex w-full flex-1 flex-col px-4 py-6 pb-16 md:px-8 md:py-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">Your admin account.</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-6">
        <section className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">Account</h2>
          </div>
          <Label
            htmlFor="admin-email"
            className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Email
          </Label>
          <Input
            id="admin-email"
            value={user?.email ?? ""}
            readOnly
            className="h-10 rounded-xl bg-secondary/70"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            To change the admin email, update it in Supabase → Authentication → Users.
          </p>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">Password</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="admin-password"
                className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                New password
              </Label>
              <PasswordInput
                id="admin-password"
                styled
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-10 rounded-xl bg-secondary/70"
              />
              <PasswordRequirements password={password} lang="en" className="mt-2" />
            </div>
            <div>
              <Label
                htmlFor="admin-password-confirm"
                className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Confirm password
              </Label>
              <PasswordInput
                id="admin-password-confirm"
                styled
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="h-10 rounded-xl bg-secondary/70"
              />
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          {message && <p className="mt-4 text-sm text-foreground">{message}</p>}
          <div className="mt-5">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl bg-card shadow-sm"
              disabled={saving}
              onClick={() => void savePassword()}
            >
              {saving ? "Updating…" : "Update password"}
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
