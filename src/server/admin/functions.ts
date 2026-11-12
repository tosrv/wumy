import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  AdminAuditEntry,
  AdminInvitation,
  AdminPayment,
  CreateForClientResult,
} from "./service";

// Server-only modules are imported inside the handlers so the service-role client
// never reaches the client bundle. Every handler checks admin_users first; callers
// who aren't admins get the same "Not found" error whatever they ask for.

async function adminContext(accessToken: string) {
  const { createAdminDb, requireAdmin } = await import("./service");
  const db = createAdminDb(process.env);
  if (!db) throw new Error("Not found");
  const adminId = await requireAdmin(db, accessToken);
  return { db, adminId };
}

const token = z.string().min(1);
const page = z.number().int().min(0).max(10_000);

/** True when the caller is an admin; never throws for non-admins. */
export const getAdminStatus = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: token }))
  .handler(async ({ data }): Promise<{ isAdmin: boolean }> => {
    try {
      await adminContext(data.accessToken);
      return { isAdmin: true };
    } catch {
      return { isAdmin: false };
    }
  });

export const adminListInvitations = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: token, page, search: z.string().max(64).optional() }))
  .handler(async ({ data }): Promise<{ rows: AdminInvitation[]; hasMore: boolean }> => {
    const { db } = await adminContext(data.accessToken);
    const { listInvitations } = await import("./service");
    return listInvitations(db, { page: data.page, search: data.search });
  });

export const adminListPayments = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: token,
      page,
      status: z.enum(["unpaid", "pending", "paid", "failed", "refunded"]).optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ rows: AdminPayment[]; hasMore: boolean }> => {
    const { db } = await adminContext(data.accessToken);
    const { listPayments } = await import("./service");
    return listPayments(db, { page: data.page, status: data.status });
  });

export const adminListAuditLog = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: token, page }))
  .handler(async ({ data }): Promise<{ rows: AdminAuditEntry[]; hasMore: boolean }> => {
    const { db } = await adminContext(data.accessToken);
    const { listAuditLog } = await import("./service");
    return listAuditLog(db, { page: data.page });
  });

export const adminMarkInvitationPaid = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: token,
      invitationId: z.string().uuid(),
      note: z.string().trim().min(3).max(500),
    }),
  )
  .handler(async ({ data }): Promise<{ alreadyPaid: boolean }> => {
    const { db, adminId } = await adminContext(data.accessToken);
    const { markInvitationPaid } = await import("./service");
    return markInvitationPaid(db, adminId, data.invitationId, data.note);
  });

export const adminCreateInvitationForClient = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: token,
      email: z.string().trim().email().max(254),
      partnerA: z.string().trim().min(1).max(80),
      partnerB: z.string().trim().min(1).max(80),
      templateId: z.string().min(1).max(64),
      markPaid: z.boolean(),
      note: z.string().trim().min(3).max(500),
    }),
  )
  .handler(async ({ data }): Promise<CreateForClientResult | { error: string }> => {
    const { db, adminId } = await adminContext(data.accessToken);
    const { createInvitationForClient, AdminActionError } = await import("./service");
    const { templateExists } = await import("@/data/templates");
    const { slugifyCouple } = await import("@/lib/invitations");
    const { isReservedSlug } = await import("@/lib/slug");
    const { absoluteUrl } = await import("@/lib/seo");
    if (!templateExists(data.templateId)) return { error: "Unknown template." };
    try {
      return await createInvitationForClient(
        db,
        adminId,
        {
          email: data.email,
          partnerA: data.partnerA,
          partnerB: data.partnerB,
          templateId: data.templateId,
          markPaid: data.markPaid,
          note: data.note,
          setPasswordUrl: absoluteUrl("/reset-password"),
        },
        { slugFor: slugifyCouple, isReserved: isReservedSlug },
      );
    } catch (err) {
      // Expected problems (existing invitation, admin email) go back to the admin as text.
      if (err instanceof AdminActionError) return { error: err.message };
      throw err;
    }
  });
