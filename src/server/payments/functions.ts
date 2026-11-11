import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Server-only modules are imported inside the handlers so nothing holding secrets
// (service-role client, DOKU signing) is pulled into the client bundle.

export const createPublishCheckout = createServerFn({ method: "POST" })
  .validator(z.object({ invitationId: z.string().uuid(), accessToken: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ url: string }> => {
    const { readPaymentConfig } = await import("./config");
    const cfg = readPaymentConfig(process.env);
    if (!cfg) throw new Error("Payments not configured");

    const { createAdminClient, createCheckoutDeps } = await import("./supabase-admin");
    const { startCheckout } = await import("./checkout");
    const { toClientError } = await import("./error-message");

    const admin = createAdminClient(cfg);
    const { data: userData, error } = await admin.auth.getUser(data.accessToken);
    if (error || !userData.user) throw new Error("Unauthorized");

    try {
      return await startCheckout(createCheckoutDeps(cfg, admin), {
        userId: userData.user.id,
        invitationId: data.invitationId,
      });
    } catch (err) {
      throw toClientError(err);
    }
  });

export const getPaymentConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ available: boolean; priceIdr: number }> => {
    const { readPaymentConfig, readPublishPriceIdr } = await import("./config");
    return {
      available: readPaymentConfig(process.env) !== null,
      priceIdr: readPublishPriceIdr(process.env),
    };
  },
);
