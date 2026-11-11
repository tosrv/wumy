import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CheckoutDeps } from "./checkout";
import { CheckoutError } from "./checkout";
import type { PaymentConfig } from "./config";
import { createCheckout, getOrderStatus } from "./doku-client";
import type { NotificationDeps } from "./notification";

/** Server-only: service-role client. Never import from client code. */
export type AdminClient = SupabaseClient<Database>;

export function createAdminClient(cfg: PaymentConfig): AdminClient {
  return createClient<Database>(cfg.supabaseUrl, cfg.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createCheckoutDeps(cfg: PaymentConfig, admin: AdminClient): CheckoutDeps {
  return {
    async getInvitation(id) {
      const { data, error } = await admin
        .from("invitations")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    async findReusablePending(invitationId, minExpiry, amountIdr) {
      const { data, error } = await admin
        .from("payments")
        .select("checkout_url")
        .eq("invitation_id", invitationId)
        .eq("provider", "doku")
        .eq("status", "pending")
        .eq("amount_cents", amountIdr * 100)
        .gt("expires_at", minExpiry.toISOString())
        .not("checkout_url", "is", null)
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data?.checkout_url ? { checkout_url: data.checkout_url } : null;
    },
    async getCustomer(userId) {
      const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);
      if (userError) throw new Error(userError.message);
      const email = userData.user?.email;
      if (!email) throw new CheckoutError("incomplete", "Account email missing");
      const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      if (profileError) throw new Error(profileError.message);
      const name = profile?.full_name?.trim() || email.split("@")[0] || email;
      return { name, email };
    },
    async insertPending(row) {
      const { error } = await admin.from("payments").insert({
        invitation_id: row.invitation_id,
        amount_cents: row.amount_idr * 100,
        currency: "IDR",
        provider: "doku",
        status: "pending",
        invoice_number: row.invoice_number,
        checkout_url: row.checkout_url,
        provider_ref: row.provider_ref,
        expires_at: row.expires_at.toISOString(),
      });
      if (error) throw new Error(error.message);
    },
    createCheckout: (input) => createCheckout(cfg, input),
    siteUrl: cfg.siteUrl,
    amountIdr: cfg.priceIdr,
    now: () => new Date(),
  };
}

export function createNotificationDeps(cfg: PaymentConfig, admin: AdminClient): NotificationDeps {
  return {
    secret: cfg.dokuSecretKey,
    clientId: cfg.dokuClientId,
    async findPaymentByInvoice(invoiceNumber) {
      const { data, error } = await admin
        .from("payments")
        .select("id, status, amount_cents")
        .eq("invoice_number", invoiceNumber)
        .eq("provider", "doku")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    getOrderStatus: (invoiceNumber) => getOrderStatus(cfg, invoiceNumber),
    async markPaid(paymentId) {
      const { error } = await admin.rpc("mark_invitation_paid", { p_payment_id: paymentId });
      if (error) throw new Error(error.message);
    },
    log: (msg, extra) => console.warn(msg, extra ?? {}),
  };
}
