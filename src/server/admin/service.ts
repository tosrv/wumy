import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, InvitationStatus, PaymentStatus } from "@/lib/supabase/database.types";

/** Server-only. Service-role client for admin actions; null when env is missing. */
export type AdminDb = SupabaseClient<Database>;

export function createAdminDb(env: Record<string, string | undefined>): AdminDb | null {
  const url = env["VITE_SUPABASE_URL"]?.trim();
  const key = env["SUPABASE_SERVICE_ROLE_KEY"]?.trim();
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export class AdminAccessError extends Error {
  constructor() {
    super("Not found");
    this.name = "AdminAccessError";
  }
}

/** Resolves the caller's user id from their access token and checks admin_users. */
export async function requireAdmin(db: AdminDb, accessToken: string): Promise<string> {
  const { data: userData, error } = await db.auth.getUser(accessToken);
  const userId = userData.user?.id;
  if (error || !userId) throw new AdminAccessError();
  const { data: admin, error: adminError } = await db
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (adminError || !admin) throw new AdminAccessError();
  return userId;
}

export const ADMIN_PAGE_SIZE = 50;

export type AdminInvitation = {
  id: string;
  slug: string;
  partnerA: string;
  partnerB: string;
  ownerId: string;
  ownerEmail: string | null;
  status: InvitationStatus;
  paymentStatus: PaymentStatus;
  publishedAt: string | null;
  createdAt: string;
};

export type AdminPayment = {
  id: string;
  invitationId: string;
  invitationSlug: string | null;
  amountIdr: number;
  provider: string;
  status: PaymentStatus;
  invoiceNumber: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type AdminAuditEntry = {
  id: number;
  adminEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  /** Action details, as compact JSON text. */
  details: string;
  createdAt: string;
};

/** `%`/`_` are LIKE wildcards; escape them so a search matches literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

async function emailsFor(db: AdminDb, userIds: string[]): Promise<Map<string, string | null>> {
  const unique = [...new Set(userIds)];
  const entries = await Promise.all(
    unique.map(async (id) => {
      const { data } = await db.auth.admin.getUserById(id);
      return [id, data.user?.email ?? null] as const;
    }),
  );
  return new Map(entries);
}

export async function listInvitations(
  db: AdminDb,
  opts: { page: number; search?: string | undefined },
): Promise<{ rows: AdminInvitation[]; hasMore: boolean }> {
  const from = opts.page * ADMIN_PAGE_SIZE;
  let query = db
    .from("invitations")
    .select(
      "id, slug, partner_a_name, partner_b_name, owner_id, status, payment_status, published_at, created_at",
    )
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE); // one extra row tells us if there is a next page
  const search = opts.search?.trim().toLowerCase();
  if (search) query = query.ilike("slug", `%${escapeLike(search)}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const page = (data ?? []).slice(0, ADMIN_PAGE_SIZE);
  const emails = await emailsFor(
    db,
    page.map((r) => r.owner_id),
  );
  return {
    hasMore: (data ?? []).length > ADMIN_PAGE_SIZE,
    rows: page.map((r) => ({
      id: r.id,
      slug: r.slug,
      partnerA: r.partner_a_name,
      partnerB: r.partner_b_name,
      ownerId: r.owner_id,
      ownerEmail: emails.get(r.owner_id) ?? null,
      status: r.status,
      paymentStatus: r.payment_status,
      publishedAt: r.published_at,
      createdAt: r.created_at,
    })),
  };
}

export async function listPayments(
  db: AdminDb,
  opts: { page: number; status?: PaymentStatus | undefined },
): Promise<{ rows: AdminPayment[]; hasMore: boolean }> {
  const from = opts.page * ADMIN_PAGE_SIZE;
  let query = db
    .from("payments")
    .select(
      "id, invitation_id, amount_cents, provider, status, invoice_number, paid_at, created_at, invitations(slug)",
    )
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE);
  if (opts.status) query = query.eq("status", opts.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Array<{
    id: string;
    invitation_id: string;
    amount_cents: number;
    provider: string;
    status: PaymentStatus;
    invoice_number: string | null;
    paid_at: string | null;
    created_at: string;
    invitations: { slug: string } | null;
  }>;
  return {
    hasMore: rows.length > ADMIN_PAGE_SIZE,
    rows: rows.slice(0, ADMIN_PAGE_SIZE).map((r) => ({
      id: r.id,
      invitationId: r.invitation_id,
      invitationSlug: r.invitations?.slug ?? null,
      amountIdr: Math.round(r.amount_cents / 100),
      provider: r.provider,
      status: r.status,
      invoiceNumber: r.invoice_number,
      paidAt: r.paid_at,
      createdAt: r.created_at,
    })),
  };
}

export async function listAuditLog(
  db: AdminDb,
  opts: { page: number },
): Promise<{ rows: AdminAuditEntry[]; hasMore: boolean }> {
  const from = opts.page * ADMIN_PAGE_SIZE;
  const { data, error } = await db
    .from("admin_audit_log")
    .select("id, admin_id, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE);
  if (error) throw new Error(error.message);
  const page = (data ?? []).slice(0, ADMIN_PAGE_SIZE);
  const emails = await emailsFor(
    db,
    page.flatMap((r) => (r.admin_id ? [r.admin_id] : [])),
  );
  return {
    hasMore: (data ?? []).length > ADMIN_PAGE_SIZE,
    rows: page.map((r) => ({
      id: r.id,
      adminEmail: r.admin_id ? (emails.get(r.admin_id) ?? null) : null,
      action: r.action,
      targetType: r.target_type,
      targetId: r.target_id,
      details: JSON.stringify(r.details ?? {}),
      createdAt: r.created_at,
    })),
  };
}

/**
 * Marks an invitation paid without a DOKU payment (comp or a missed webhook).
 * Records a zero-amount `manual` payment and runs the same `mark_invitation_paid`
 * path as the webhook, then writes the audit log. Does not publish.
 */
export async function markInvitationPaid(
  db: AdminDb,
  adminId: string,
  invitationId: string,
  note: string,
): Promise<{ alreadyPaid: boolean }> {
  const { data: invitation, error } = await db
    .from("invitations")
    .select("id, slug, payment_status")
    .eq("id", invitationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!invitation) throw new Error("Invitation not found");
  if (invitation.payment_status === "paid") return { alreadyPaid: true };

  const { data: payment, error: insertError } = await db
    .from("payments")
    .insert({
      invitation_id: invitationId,
      amount_cents: 0,
      currency: "IDR",
      provider: "manual",
      provider_ref: `admin-${adminId}`,
      status: "pending",
    })
    .select("id")
    .single();
  if (insertError) throw new Error(insertError.message);

  const { error: rpcError } = await db.rpc("mark_invitation_paid", { p_payment_id: payment.id });
  if (rpcError) throw new Error(rpcError.message);

  const { error: logError } = await db.from("admin_audit_log").insert({
    admin_id: adminId,
    action: "mark_paid",
    target_type: "invitation",
    target_id: invitationId,
    details: { slug: invitation.slug, note, payment_id: payment.id },
  });
  if (logError) console.error("admin audit log failed", logError.message);

  return { alreadyPaid: false };
}

/** Finds an auth user id by email (case-insensitive), scanning the user list page by page. */
export async function findUserIdByEmail(db: AdminDb, email: string): Promise<string | null> {
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < 1000) return null;
  }
  return null;
}

export class AdminActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminActionError";
  }
}

export type CreateForClientInput = {
  email: string;
  partnerA: string;
  partnerB: string;
  templateId: string;
  markPaid: boolean;
  note: string;
  /** Where the invite email sends the client to set a password. */
  setPasswordUrl: string;
};

export type CreateForClientResult = {
  invitationId: string;
  slug: string;
  /** True when a new account was created and an invite email was sent. */
  invited: boolean;
  paid: boolean;
};

async function firstFreeSlug(db: AdminDb, candidates: string[]): Promise<string> {
  for (const slug of candidates) {
    const { data, error } = await db.from("invitations").select("id").eq("slug", slug).limit(1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return slug;
  }
  return `draft-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Creates (or reuses) a client account and a draft invitation for it, optionally
 * marking it paid. New accounts get a Supabase invite email to set their own password,
 * so the admin never handles the client's password. The client fills in and publishes
 * the invitation themselves.
 */
export async function createInvitationForClient(
  db: AdminDb,
  adminId: string,
  input: CreateForClientInput,
  deps: {
    slugFor: (a: string, b: string) => string;
    isReserved: (slug: string) => boolean;
  },
): Promise<CreateForClientResult> {
  const email = input.email.trim().toLowerCase();

  let userId = await findUserIdByEmail(db, email);
  let invited = false;
  if (!userId) {
    const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
      redirectTo: input.setPasswordUrl,
      data: { full_name: `${input.partnerA} & ${input.partnerB}` },
    });
    if (error || !data.user) throw new Error(error?.message ?? "Invite failed");
    userId = data.user.id;
    invited = true;
  } else {
    const { data: admin } = await db
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (admin) throw new AdminActionError("That email belongs to an admin account.");
    const { data: existing, error } = await db
      .from("invitations")
      .select("slug")
      .eq("owner_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (existing) {
      throw new AdminActionError(
        `This client already has an invitation (/${existing.slug}). Use Mark as paid on it instead.`,
      );
    }
  }

  const base = deps.slugFor(input.partnerA, input.partnerB);
  const candidates = [
    base,
    `${base}-2`,
    `${base}-3`,
    `${base}-${Date.now().toString(36).slice(-4)}`,
  ].filter((s) => s.length <= 64 && !deps.isReserved(s));
  const slug = await firstFreeSlug(db, candidates);

  const { data: invitation, error: insertError } = await db
    .from("invitations")
    .insert({
      owner_id: userId,
      template_id: input.templateId,
      slug,
      partner_a_name: input.partnerA,
      partner_b_name: input.partnerB,
      status: "draft",
      payment_status: "unpaid",
    })
    .select("id")
    .single();
  if (insertError) throw new Error(insertError.message);

  const { error: logError } = await db.from("admin_audit_log").insert({
    admin_id: adminId,
    action: "create_for_client",
    target_type: "invitation",
    target_id: invitation.id,
    details: { email, slug, invited, note: input.note },
  });
  if (logError) console.error("admin audit log failed", logError.message);

  let paid = false;
  if (input.markPaid) {
    await markInvitationPaid(db, adminId, invitation.id, input.note);
    paid = true;
  }

  return { invitationId: invitation.id, slug, invited, paid };
}
