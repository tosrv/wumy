import { useEffect, useState } from "react";
import { createPublishCheckout, getPaymentConfig } from "@/server/payments/functions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type { InvitationRow } from "@/lib/invitations";
import { DEFAULT_PUBLISH_PRICE_IDR, formatIdr } from "@/lib/pricing";

export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

export { DEFAULT_PUBLISH_PRICE_IDR } from "@/lib/pricing";
export const PUBLISH_CURRENCY = "IDR";

export function formatPublishPrice(priceIdr: number = DEFAULT_PUBLISH_PRICE_IDR): string {
  return formatIdr(priceIdr);
}

export async function listPaymentsForInvitations(invitationIds: string[]): Promise<PaymentRow[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || invitationIds.length === 0) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .in("invitation_id", invitationIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Starts a DOKU checkout for the invitation; resolves to the hosted payment URL. */
export async function startPublishCheckout(invitationId: string): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Unauthorized");
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("Unauthorized");
  const { url } = await createPublishCheckout({ data: { invitationId, accessToken } });
  return url;
}

/** Maps a checkout error to a friendly Indonesian message. */
export function checkoutErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  const code = msg.split(":")[0]?.trim() ?? "";
  if (code === "already_paid") return "Undangan ini sudah dibayar.";
  if (code === "incomplete") return "Lengkapi detail undangan terlebih dahulu sebelum membayar.";
  if (code === "not_found") return "Undangan tidak ditemukan.";
  if (code === "Unauthorized") return "Sesi Anda berakhir. Silakan masuk kembali.";
  if (code === "Payment provider error")
    return "Layanan pembayaran sedang bermasalah. Coba lagi beberapa saat lagi.";
  return "Gagal memulai pembayaran. Coba lagi.";
}

export type PaymentConfigState = {
  /** null while loading; true when online payment (DOKU) is configured. */
  available: boolean | null;
  /** Publish fee in rupiah as charged by the server (default until loaded). */
  priceIdr: number;
};

export function usePaymentConfig(): PaymentConfigState {
  const [state, setState] = useState<PaymentConfigState>({
    available: null,
    priceIdr: DEFAULT_PUBLISH_PRICE_IDR,
  });
  useEffect(() => {
    let cancelled = false;
    getPaymentConfig()
      .then((r) => {
        if (!cancelled) setState({ available: r.available, priceIdr: r.priceIdr });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, available: false }));
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

/** Mark invitation awaiting payment (optional step before checkout UI). */
export async function markPendingPayment(invitationId: string): Promise<InvitationRow> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("invitations")
    .update({ status: "pending_payment" })
    .eq("id", invitationId)
    .neq("payment_status", "paid")
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
