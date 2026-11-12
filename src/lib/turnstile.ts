/**
 * Cloudflare Turnstile (CAPTCHA) helpers.
 *
 * Captcha is on only when VITE_TURNSTILE_SITE_KEY is set, so local dev works without it.
 * The token is passed to Supabase Auth, which verifies it server-side with the secret key
 * configured in Supabase → Authentication → Attack Protection.
 */

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  size?: "normal" | "flexible" | "compact";
  language?: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

export type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function getTurnstileSiteKey(): string {
  const key = import.meta.env["VITE_TURNSTILE_SITE_KEY"] as string | undefined;
  return key?.trim() ?? "";
}

export function isTurnstileEnabled(): boolean {
  return getTurnstileSiteKey() !== "";
}

let loading: Promise<TurnstileApi> | null = null;

/** Loads the Turnstile script once and resolves with its API. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;

  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile failed to initialise"));
    };
    script.onerror = () => {
      loading = null;
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export const CAPTCHA_FAILED_MESSAGE =
  "Verifikasi keamanan gagal atau kedaluwarsa. Selesaikan verifikasi lagi lalu coba ulang.";

/** Supabase Auth rejects a missing/invalid token with a message mentioning "captcha". */
export function isCaptchaError(message: string | null | undefined): boolean {
  return Boolean(message && /captcha/i.test(message));
}
