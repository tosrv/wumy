/**
 * Form field look shared with the login/sign-up form (`AuthForm`).
 * Pass to `Input`, `PasswordInput styled`, `Textarea`, or a native `<select>`.
 * Uses `text-base` (16px, same as `text-body-md`): tailwind-merge drops `text-body-md`
 * as a color class when merged with the shadcn base styles.
 */
export const fieldClass =
  "h-12 w-full rounded-2xl border border-border-subtle bg-surface-canvas px-4 font-body-md text-base leading-6 text-charcoal shadow-none outline-none placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-base";

/** Same look for multi-line fields. */
export const textareaFieldClass = `${fieldClass} h-auto min-h-24 py-3`;

/** Native `<select>` with the field look. */
export const selectFieldClass = `${fieldClass} cursor-pointer`;
