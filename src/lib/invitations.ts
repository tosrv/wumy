import { exceedsPhotoCap } from "@/lib/photo-slots";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { storagePublicUrl, storageRemove, storageUpload } from "@/lib/storage";
import { BUCKET_RULES, PHOTO_BUCKET } from "@/lib/storage-rules";
import type { Database } from "@/lib/supabase/database.types";
import { legacyColumnsFromContent, parseContent } from "@/lib/invitation-content-io";
import {
  contentPublishSchema,
  photoRoleSchema,
  type InvitationContent,
  type PhotoRole,
} from "@/lib/invitation-content";
import { musicPathForCleanup, removeInvitationMusic } from "@/lib/invitation-music";
import { isReservedSlug, isValidSlug } from "@/lib/slug";
import { guestInvitationDisplay, guestInvitationPublicUrl } from "@/lib/urls";

export { isValidSlug };

export type InvitationRow = Database["public"]["Tables"]["invitations"]["Row"];
export type InvitationInsert = Database["public"]["Tables"]["invitations"]["Insert"];
export type InvitationUpdate = Database["public"]["Tables"]["invitations"]["Update"];
export type InvitationPhotoRow = Database["public"]["Tables"]["invitation_photos"]["Row"];

export type WeddingDetailsInput = {
  templateId: string;
  partnerAName: string;
  partnerBName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  story: string;
  slug: string;
};

export const MAX_INVITATION_PHOTOS = 6;
export const MAX_PHOTO_BYTES = BUCKET_RULES[PHOTO_BUCKET].maxBytes;

export function slugifyCouple(partnerA: string, partnerB: string): string {
  const raw = [partnerA, partnerB]
    .map((part) =>
      part
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("-");

  const clipped = raw.slice(0, 64).replace(/-+$/g, "");
  return clipped.length >= 3 ? clipped : "our-wedding";
}

export async function isSlugAvailable(
  slug: string,
  excludeInvitationId?: string,
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  let query = supabase.from("invitations").select("id").eq("slug", slug).limit(1);
  if (excludeInvitationId) {
    query = query.neq("id", excludeInvitationId);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return !data || data.length === 0;
}

export async function listMyInvitations(): Promise<InvitationRow[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getInvitationById(invitationId: string): Promise<InvitationRow | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", invitationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createDraftInvitation(
  ownerId: string,
  details: WeddingDetailsInput,
): Promise<InvitationRow> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  if (!isValidSlug(details.slug)) {
    throw new Error("Slug must be 3–64 characters: lowercase letters, numbers, and hyphens.");
  }

  const available = await isSlugAvailable(details.slug);
  if (!available) {
    throw new Error("That URL slug is already taken. Try another.");
  }

  const payload: InvitationInsert = {
    owner_id: ownerId,
    template_id: details.templateId,
    slug: details.slug,
    partner_a_name: details.partnerAName.trim(),
    partner_b_name: details.partnerBName.trim(),
    wedding_date: details.weddingDate || null,
    venue_name: details.venueName.trim(),
    venue_address: details.venueAddress.trim(),
    story: details.story.trim(),
    status: "draft",
    payment_status: "unpaid",
  };

  const { data, error } = await supabase.from("invitations").insert(payload).select("*").single();

  if (error) throw new Error(error.message);
  return data;
}

export type SlugSaveError = "invalid" | "reserved" | "taken";

/** Why a slug cannot be saved, or null when it can. `available` is only consulted for valid slugs. */
export async function slugSaveError(
  slug: string,
  available: (slug: string) => Promise<boolean>,
): Promise<SlugSaveError | null> {
  if (isReservedSlug(slug)) return "reserved";
  if (!isValidSlug(slug)) return "invalid";
  return (await available(slug)) ? null : "taken";
}

export type UpdateInvitationResult = {
  invitation: InvitationRow;
  /** Set when the slug was invalid or taken; it was left unchanged and everything else saved. */
  slugError: SlugSaveError | null;
};

/**
 * A slug is locked once the invitation has ever been published: guests already have
 * links to it. Enforced in the DB by `invitations_guard_published_slug` (supabase/schema.sql).
 */
export function isSlugLocked(invitation: { published_at: string | null }): boolean {
  return invitation.published_at != null;
}

/**
 * Saves details and content. An unusable slug is skipped (reported in `slugError`), not fatal.
 * With `slugLocked`, the slug is never sent (and not checked).
 */
export async function updateInvitation(
  invitationId: string,
  details: WeddingDetailsInput,
  content?: InvitationContent,
  opts: { slugLocked?: boolean } = {},
): Promise<UpdateInvitationResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const slugError = opts.slugLocked
    ? null
    : await slugSaveError(details.slug, (slug) => isSlugAvailable(slug, invitationId));
  const sendSlug = !opts.slugLocked && !slugError;

  const payload: InvitationUpdate = {
    template_id: details.templateId,
    ...(sendSlug ? { slug: details.slug } : {}),
    partner_a_name: details.partnerAName.trim(),
    partner_b_name: details.partnerBName.trim(),
    wedding_date: details.weddingDate || null,
    venue_name: details.venueName.trim(),
    venue_address: details.venueAddress.trim(),
    story: details.story.trim(),
    // When content is saved, legacy columns mirror it so lists and slugs keep working.
    ...(content ? { content, ...legacyColumnsFromContent(content) } : {}),
  };

  const { data, error } = await supabase
    .from("invitations")
    .update(payload)
    .eq("id", invitationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return { invitation: data, slugError };
}

/** One account → one wedding invitation: switch template without creating a new draft. */
export async function updateInvitationTemplate(
  invitationId: string,
  templateId: string,
): Promise<InvitationRow> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("invitations")
    .update({ template_id: templateId })
    .eq("id", invitationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteInvitation(invitationId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const photos = await listInvitationPhotos(invitationId);
  if (photos.length > 0) {
    const paths = photos.map((photo) => photo.storage_path);
    await storageRemove(PHOTO_BUCKET, paths);
  }

  // Storage write policies check that the invitation row exists and is owned by
  // the user, so files must be removed before the row is deleted.
  const invitation = await getInvitationById(invitationId);
  const musicPath = invitation ? musicPathForCleanup(invitation.content) : null;
  if (musicPath) await removeInvitationMusic(musicPath);

  const { error } = await supabase.from("invitations").delete().eq("id", invitationId);

  if (error) throw new Error(error.message);
}

export async function listInvitationPhotos(invitationId: string): Promise<InvitationPhotoRow[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("invitation_photos")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function uploadInvitationPhotos(
  ownerId: string,
  invitationId: string,
  files: File[],
  role: PhotoRole = "gallery",
): Promise<InvitationPhotoRow[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  if (files.length === 0) return [];
  if (role !== "gallery" && files.length > 1) {
    throw new Error("A single photo is expected for this slot.");
  }

  const existing = await listInvitationPhotos(invitationId);
  // Only gallery photos count toward the limit; partner/cover photos have their own slots.
  if (exceedsPhotoCap(existing, role, files.length, MAX_INVITATION_PHOTOS)) {
    throw new Error(`You can upload up to ${MAX_INVITATION_PHOTOS} photos.`);
  }

  const tooBig = files.find((file) => file.size > MAX_PHOTO_BYTES);
  if (tooBig) {
    throw new Error("Each photo must be under 5MB.");
  }

  const startOrder = existing.reduce((max, photo) => Math.max(max, photo.sort_order), -1) + 1;
  const created: InvitationPhotoRow[] = [];

  for (const [index, file] of files.entries()) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `${ownerId}/${invitationId}/${Date.now()}-${index}-${safeName}`;

    await storageUpload(PHOTO_BUCKET, path, file, file.type);

    const { data, error: rowError } = await supabase
      .from("invitation_photos")
      .insert({
        invitation_id: invitationId,
        storage_path: path,
        sort_order: startOrder + index,
        caption: "",
        // A held partner/cover slot is replaced via replaceInvitationPhotoFile, so a
        // non-gallery role is only inserted into an empty slot (unique index enforces it).
        role,
      })
      .select("*")
      .single();

    if (rowError) {
      await storageRemove(PHOTO_BUCKET, [path]).catch(() => undefined);
      throw new Error(rowError.message);
    }
    created.push(data);
  }

  return created;
}

export type ReplacePhotoDeps = {
  upload(path: string): Promise<void>;
  updatePath(photoId: string, path: string): Promise<InvitationPhotoRow>;
  remove(path: string): Promise<void>;
};

/**
 * Internal (exported for tests). Swap a photo's file while keeping its row (and role):
 * upload the new file, repoint the row, then remove the old file. No row is added, so
 * replacing a partner/cover photo never trips the per-invitation photo caps.
 */
export async function replacePhotoFileWith(
  deps: ReplacePhotoDeps,
  photo: Pick<InvitationPhotoRow, "id" | "storage_path">,
  newPath: string,
): Promise<InvitationPhotoRow> {
  await deps.upload(newPath);
  let row: InvitationPhotoRow;
  try {
    row = await deps.updatePath(photo.id, newPath);
  } catch (err) {
    await deps.remove(newPath).catch(() => undefined);
    throw err;
  }
  try {
    await deps.remove(photo.storage_path);
  } catch (err) {
    console.warn("Could not remove replaced photo file:", err);
  }
  return row;
}

export async function replaceInvitationPhotoFile(
  ownerId: string,
  invitationId: string,
  photo: InvitationPhotoRow,
  file: File,
): Promise<InvitationPhotoRow> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  if (file.size > MAX_PHOTO_BYTES) throw new Error("Each photo must be under 5MB.");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const newPath = `${ownerId}/${invitationId}/${Date.now()}-0-${safeName}`;

  return replacePhotoFileWith(
    {
      async upload(path) {
        await storageUpload(PHOTO_BUCKET, path, file, file.type);
      },
      async updatePath(photoId, path) {
        const { data, error } = await supabase
          .from("invitation_photos")
          .update({ storage_path: path })
          .eq("id", photoId)
          .select("*")
          .single();
        if (error) throw new Error(error.message);
        return data;
      },
      async remove(path) {
        await storageRemove(PHOTO_BUCKET, [path]);
      },
    },
    photo,
    newPath,
  );
}

export async function deleteInvitationPhoto(photo: InvitationPhotoRow): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  await storageRemove(PHOTO_BUCKET, [photo.storage_path]);

  const { error } = await supabase.from("invitation_photos").delete().eq("id", photo.id);

  if (error) throw new Error(error.message);
}

export async function updatePhotoCaption(
  photoId: string,
  caption: string,
): Promise<InvitationPhotoRow> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("invitation_photos")
    .update({ caption: caption.trim() })
    .eq("id", photoId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Assign a photo to a role; the previous holder of that role goes back to the gallery. */
export async function setPhotoRole(
  invitationId: string,
  photoId: string,
  role: PhotoRole,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  if (role !== "gallery") {
    const { error: clearError } = await supabase
      .from("invitation_photos")
      .update({ role: "gallery" })
      .eq("invitation_id", invitationId)
      .eq("role", role)
      .neq("id", photoId);
    if (clearError) throw new Error(clearError.message);
  }

  const { error } = await supabase
    .from("invitation_photos")
    .update({ role })
    .eq("id", photoId)
    .eq("invitation_id", invitationId);
  if (error) throw new Error(error.message);
}

export function publicPhotoUrl(storagePath: string): string {
  return storagePublicUrl(PHOTO_BUCKET, storagePath);
}

export function formatWeddingDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function listInvitationRsvps(
  invitationId: string,
): Promise<Database["public"]["Tables"]["rsvps"]["Row"][]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function countInvitationGuests(invitationId: string): Promise<number> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true })
    .eq("invitation_id", invitationId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export type GuestRow = Database["public"]["Tables"]["guests"]["Row"];

export function guestPersonalizationKey(name: string): string {
  const raw = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return raw || "guest";
}

export function guestPublicLink(slug: string, guest: GuestRow): string {
  const key = guest.personalization_key || guestPersonalizationKey(guest.name);
  return guestInvitationDisplay(slug, key);
}

/** Absolute guest invite URL for copy / WhatsApp / share. */
export function guestPublicUrl(slug: string, guest: GuestRow): string {
  const key = guest.personalization_key || guestPersonalizationKey(guest.name);
  return guestInvitationPublicUrl(slug, key);
}

/** Load a published+paid invitation by public slug (anon RLS). */
export async function getPublishedInvitationBySlug(slug: string): Promise<InvitationRow | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !isValidSlug(slug)) return null;

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("payment_status", "paid")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** Photos (with roles) for a published invitation (public RLS). */
export async function listPublishedInvitationPhotos(
  invitationId: string,
): Promise<{ url: string; role: PhotoRole }[]> {
  const photos = await listInvitationPhotos(invitationId);
  return photos
    .map((photo) => ({
      url: publicPhotoUrl(photo.storage_path),
      role: photoRoleSchema.catch("gallery").parse(photo.role),
    }))
    .filter((photo) => photo.url);
}

export type PublicRsvpInput = {
  invitationId: string;
  guestName: string;
  status: "coming" | "not_coming";
  partySize?: number;
  message?: string;
  guestId?: string | null;
};

/** Guest RSVP insert (requires invitation published + paid). */
export async function submitPublicRsvp(
  input: PublicRsvpInput,
): Promise<Database["public"]["Tables"]["rsvps"]["Row"]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const guestName = input.guestName.trim();
  if (!guestName) throw new Error("Nama wajib diisi.");

  const { data, error } = await supabase
    .from("rsvps")
    .insert({
      invitation_id: input.invitationId,
      guest_name: guestName,
      guest_id: input.guestId ?? null,
      status: input.status,
      party_size: Math.min(20, Math.max(1, input.partySize ?? 1)),
      message: input.message?.trim() ?? "",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Publish a paid invitation to public /{slug}.
 * Requires payment_status === 'paid' (complete checkout first).
 */
export async function publishInvitation(invitationId: string): Promise<InvitationRow> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: current, error: loadError } = await supabase
    .from("invitations")
    .select(
      "payment_status, content, partner_a_name, partner_b_name, wedding_date, venue_name, venue_address",
    )
    .eq("id", invitationId)
    .single();

  if (loadError) throw new Error(loadError.message);
  if (current.payment_status !== "paid") {
    throw new Error("Payment required before publishing.");
  }
  if (!contentPublishSchema.safeParse(parseContent(current)).success) {
    throw new Error("Complete the required invitation details before publishing.");
  }

  const { data, error } = await supabase
    .from("invitations")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", invitationId)
    .eq("payment_status", "paid")
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export function guestDisplayNameFromToParam(to: string | undefined): string | undefined {
  if (!to?.trim()) return undefined;
  return to
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Resolve guest profile from ?to= key on a published invite (RPC, name only).
 * Falls back to title-cased key when no row matches.
 */
export async function resolvePublicGuest(
  invitationId: string,
  toParam: string | undefined,
): Promise<{ guestId?: string; displayName?: string }> {
  if (!toParam?.trim()) return {};
  const key = toParam.trim().toLowerCase();
  const fallback = guestDisplayNameFromToParam(toParam);
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return fallback ? { displayName: fallback } : {};
  }

  const { data, error } = await supabase.rpc("resolve_guest_by_key", {
    p_invitation_id: invitationId,
    p_key: key,
  });

  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) {
    return fallback ? { displayName: fallback } : {};
  }

  return { guestId: row.id, displayName: row.name };
}

export async function listInvitationGuests(invitationId: string): Promise<GuestRow[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createInvitationGuest(input: {
  invitationId: string;
  name: string;
  email?: string | null;
  personalizationKey?: string | null;
  guestGroup?: string;
  note?: string;
}): Promise<GuestRow> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const name = input.name.trim();
  if (!name) throw new Error("Guest name is required.");

  const { data, error } = await supabase
    .from("guests")
    .insert({
      invitation_id: input.invitationId,
      name,
      email: input.email?.trim() || null,
      personalization_key: input.personalizationKey?.trim() || guestPersonalizationKey(name),
      guest_group: input.guestGroup?.trim() || "General",
      note: input.note?.trim() || "",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteInvitationGuests(guestIds: string[]): Promise<void> {
  if (guestIds.length === 0) return;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("guests").delete().in("id", guestIds);
  if (error) throw new Error(error.message);
}

export function daysUntilWedding(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  const target = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function invitationToDetailsInput(invitation: InvitationRow): WeddingDetailsInput {
  return {
    templateId: invitation.template_id,
    partnerAName: invitation.partner_a_name,
    partnerBName: invitation.partner_b_name,
    weddingDate: invitation.wedding_date ?? "",
    venueName: invitation.venue_name,
    venueAddress: invitation.venue_address,
    story: invitation.story,
    slug: invitation.slug,
  };
}
