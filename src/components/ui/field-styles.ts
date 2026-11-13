/**
 * Form field look shared with the login/sign-up form (`AuthForm`).
 * Pass to `Input`, `PasswordInput styled`, `Textarea`, or a native `<select>`.
 * Sizes (height, padding, text) match the shadcn `Input`; only the look comes from `AuthForm`.
 */
export const fieldClass =
  "h-9 w-full rounded-2xl border border-border-subtle bg-surface-canvas px-3 font-body-md text-base text-charcoal shadow-none outline-none placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

/** Same look for multi-line fields. */
export const textareaFieldClass = `${fieldClass} h-auto min-h-[60px] py-2`;

/** Native `<select>` with the field look. */
export const selectFieldClass = `${fieldClass} cursor-pointer`;
