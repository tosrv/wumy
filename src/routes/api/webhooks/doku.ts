import { createFileRoute } from "@tanstack/react-router";

const TARGET = "/api/webhooks/doku";

const text = (body: string, status: number) =>
  new Response(body, { status, headers: { "content-type": "text/plain" } });

export const Route = createFileRoute("/api/webhooks/doku")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { readPaymentConfig } = await import("@/server/payments/config");
          const cfg = readPaymentConfig(process.env);
          if (!cfg) return text("Payments not configured", 503);
          const { createAdminClient, createNotificationDeps } =
            await import("@/server/payments/supabase-admin");
          const { handleDokuNotification } = await import("@/server/payments/notification");
          const raw = await request.text();
          const { status, body } = await handleDokuNotification(
            createNotificationDeps(cfg, createAdminClient(cfg)),
            { headers: request.headers, rawBody: raw, target: TARGET },
          );
          return text(body, status);
        } catch (err) {
          // Only the error name/message: never headers, body or config values.
          console.warn("doku webhook: unhandled failure", {
            error: err instanceof Error ? `${err.name}: ${err.message}` : "non-Error thrown",
          });
          return text("error", 200);
        }
      },
    },
  },
});
