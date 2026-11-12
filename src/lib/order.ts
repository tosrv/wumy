import { getTemplateById } from "@/data/templates";
import {
  createDraftInvitation,
  isSlugAvailable,
  listMyInvitations,
  updateInvitationTemplate,
  type InvitationRow,
} from "@/lib/invitations";

/** Only a paid invitation may open the editor; everyone else goes to /order. */
export function orderRedirect(inv: { payment_status: string } | null): "order" | "editor" {
  return inv?.payment_status === "paid" ? "editor" : "order";
}

async function uniqueDraftSlug(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = `draft-${crypto.randomUUID().slice(0, 8)}`;
    if (await isSlugAvailable(slug)) return slug;
  }
  return `draft-${Date.now().toString(36)}`;
}

/**
 * The draft invitation row is the order. One account → one invitation:
 * reuse it (switching template while unpaid) or create a fresh draft.
 */
type OrderResult =
  | { invitation: InvitationRow; redirectToEditor: boolean; needsTemplate?: false }
  /** No invitation yet and no (valid) template chosen: send the user to the catalog first. */
  | { needsTemplate: true };

const inFlight = new Map<string, Promise<OrderResult>>();

/** True for the one-invitation-per-owner unique violation (Postgres 23505). */
function isOwnerUniqueViolation(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return msg.includes("invitations_owner_unique");
}

export function ensureOrderInvitation(userId: string, templateId?: string): Promise<OrderResult> {
  // Concurrent calls for one user (StrictMode, auth refresh) share one run.
  const pending = inFlight.get(userId);
  if (pending) return pending;
  const run = runEnsureOrderInvitation(userId, templateId).finally(() => {
    inFlight.delete(userId);
  });
  inFlight.set(userId, run);
  return run;
}

async function runEnsureOrderInvitation(userId: string, templateId?: string): Promise<OrderResult> {
  const existing = (await listMyInvitations())[0] ?? null;

  if (existing) {
    if (orderRedirect(existing) === "editor") {
      return { invitation: existing, redirectToEditor: true };
    }
    const next = getTemplateById(templateId);
    if (next && next.id !== existing.template_id) {
      const updated = await updateInvitationTemplate(existing.id, next.id);
      return { invitation: updated, redirectToEditor: false };
    }
    return { invitation: existing, redirectToEditor: false };
  }

  const template = getTemplateById(templateId);
  if (!template) return { needsTemplate: true };
  const slug = await uniqueDraftSlug();
  let invitation: InvitationRow;
  try {
    invitation = await createDraftInvitation(userId, {
      templateId: template.id,
      partnerAName: "",
      partnerBName: "",
      weddingDate: "",
      venueName: "",
      venueAddress: "",
      story: "",
      slug,
    });
  } catch (err) {
    // Another tab created it first (unique index on owner_id): use that one.
    if (!isOwnerUniqueViolation(err)) throw err;
    const raced = (await listMyInvitations())[0];
    if (!raced) throw err;
    return { invitation: raced, redirectToEditor: orderRedirect(raced) === "editor" };
  }
  return { invitation, redirectToEditor: false };
}
