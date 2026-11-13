type UserLike =
  | {
      email?: string | null;
      user_metadata?: Record<string, unknown> | null;
    }
  | null
  | undefined;

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Name the user chose in Settings, falling back to the name from sign-up or the OAuth provider.
 *
 * `display_name` is our own metadata key. Supabase overwrites provider keys such as `full_name`
 * from Google on every OAuth sign-in, so a name edited in Settings must not live there.
 */
export function getProfileName(user: UserLike): string {
  const meta = user?.user_metadata ?? {};
  return readString(meta["display_name"]) || readString(meta["full_name"]);
}

/** Profile name, else the local part of the email, else `fallback`. */
export function getDisplayName(user: UserLike, fallback: string): string {
  return getProfileName(user) || user?.email?.split("@")[0] || fallback;
}
