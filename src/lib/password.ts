export const MIN_PASSWORD_LENGTH = 8;

export type PasswordRuleId = "length" | "lower" | "upper" | "digit" | "symbol";

export type PasswordRule = {
  id: PasswordRuleId;
  test: (password: string) => boolean;
  label: { id: string; en: string };
};

/**
 * Strong-password rules. Keep these in step with Supabase → Authentication → Sign In / Providers
 * → Password requirements, which enforces them on the server.
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    test: (p) => p.length >= MIN_PASSWORD_LENGTH,
    label: {
      id: `Minimal ${MIN_PASSWORD_LENGTH} karakter`,
      en: `At least ${MIN_PASSWORD_LENGTH} characters`,
    },
  },
  {
    id: "lower",
    test: (p) => /[a-z]/.test(p),
    label: { id: "Huruf kecil (a-z)", en: "A lowercase letter (a-z)" },
  },
  {
    id: "upper",
    test: (p) => /[A-Z]/.test(p),
    label: { id: "Huruf besar (A-Z)", en: "An uppercase letter (A-Z)" },
  },
  {
    id: "digit",
    test: (p) => /[0-9]/.test(p),
    label: { id: "Angka (0-9)", en: "A number (0-9)" },
  },
  {
    id: "symbol",
    test: (p) => /[^A-Za-z0-9]/.test(p),
    label: { id: "Simbol (mis. ! @ # ?)", en: "A symbol (e.g. ! @ # ?)" },
  },
];

/** Rules the password does not meet yet, in display order. */
export function unmetPasswordRules(password: string): PasswordRuleId[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.id);
}

export function isStrongPassword(password: string): boolean {
  return unmetPasswordRules(password).length === 0;
}

const WEAK_PASSWORD_MESSAGE = {
  id: "Kata sandi belum cukup kuat. Gunakan minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan simbol.",
  en: "Password is not strong enough. Use at least 8 characters with uppercase and lowercase letters, a number, and a symbol.",
} as const;

/** Validation message for a new password, or null when it is acceptable. */
export function newPasswordIssue(
  password: string,
  confirm: string,
  lang: "id" | "en" = "id",
): string | null {
  if (!isStrongPassword(password)) return WEAK_PASSWORD_MESSAGE[lang];
  if (password !== confirm) {
    return lang === "id"
      ? "Konfirmasi kata sandi tidak sama."
      : "Password confirmation does not match.";
  }
  return null;
}
