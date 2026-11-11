export const MIN_PASSWORD_LENGTH = 8;

/** Indonesian validation message for a new password, or null when it is acceptable. */
export function newPasswordIssue(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  if (password !== confirm) return "Konfirmasi kata sandi tidak sama.";
  return null;
}
