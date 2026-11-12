/** Browser helpers for the admin page: attach the session token to admin server functions. */
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  adminListAuditLog,
  adminListInvitations,
  adminListPayments,
  adminMarkInvitationPaid,
  getAdminStatus,
} from "@/server/admin/functions";
import type { PaymentStatus } from "@/lib/supabase/database.types";

async function accessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function requireToken(): Promise<string> {
  const token = await accessToken();
  if (!token) throw new Error("Not signed in");
  return token;
}

export async function checkIsAdmin(): Promise<boolean> {
  const token = await accessToken();
  if (!token) return false;
  return (await getAdminStatus({ data: { accessToken: token } })).isAdmin;
}

export async function fetchAdminInvitations(page: number, search?: string) {
  const accessToken = await requireToken();
  return adminListInvitations({
    data: { accessToken, page, ...(search ? { search } : {}) },
  });
}

export async function fetchAdminPayments(page: number, status?: PaymentStatus) {
  const accessToken = await requireToken();
  return adminListPayments({ data: { accessToken, page, ...(status ? { status } : {}) } });
}

export async function fetchAdminAuditLog(page: number) {
  return adminListAuditLog({ data: { accessToken: await requireToken(), page } });
}

export async function markInvitationPaidAsAdmin(invitationId: string, note: string) {
  return adminMarkInvitationPaid({
    data: { accessToken: await requireToken(), invitationId, note },
  });
}
