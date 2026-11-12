import * as React from "react";

import { getTurnstileSiteKey, loadTurnstile } from "@/lib/turnstile";
import { cn } from "@/lib/utils";

export type TurnstileWidgetHandle = {
  /** Get a fresh token; Turnstile tokens are single-use. */
  reset: () => void;
};

type TurnstileWidgetProps = {
  /** Called with a token when verification passes, and with null when it expires or fails. */
  onToken: (token: string | null) => void;
  action?: string;
  className?: string;
};

/** Cloudflare Turnstile widget. Renders nothing when no site key is configured. */
export const TurnstileWidget = React.forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  ({ onToken, action, className }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const widgetIdRef = React.useRef<string | null>(null);
    const onTokenRef = React.useRef(onToken);
    const [loadFailed, setLoadFailed] = React.useState(false);
    const siteKey = getTurnstileSiteKey();

    onTokenRef.current = onToken;

    React.useImperativeHandle(ref, () => ({
      reset() {
        onTokenRef.current(null);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    React.useEffect(() => {
      if (!siteKey || !containerRef.current) return;
      let cancelled = false;

      loadTurnstile()
        .then((turnstile) => {
          if (cancelled || !containerRef.current) return;
          widgetIdRef.current = turnstile.render(containerRef.current, {
            sitekey: siteKey,
            size: "flexible",
            language: "id",
            ...(action ? { action } : {}),
            callback: (token) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(null),
            "error-callback": () => onTokenRef.current(null),
          });
        })
        .catch(() => {
          if (!cancelled) setLoadFailed(true);
        });

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
        }
        widgetIdRef.current = null;
      };
    }, [siteKey, action]);

    if (!siteKey) return null;

    return (
      <div className={cn("min-h-[65px]", className)}>
        <div ref={containerRef} />
        {loadFailed && (
          <p className="text-sm text-muted-foreground">
            Verifikasi keamanan gagal dimuat. Periksa koneksi atau matikan pemblokir iklan, lalu
            muat ulang halaman.
          </p>
        )}
      </div>
    );
  },
);
TurnstileWidget.displayName = "TurnstileWidget";
