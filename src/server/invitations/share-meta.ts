import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv } from "@/lib/supabase/client";
import { parseContent } from "@/lib/invitation-content-io";
import { isValidSlug } from "@/lib/slug";
import { pickShareImage, type ShareMetaInput } from "@/lib/share-meta";

const PHOTO_BUCKET = "invitation-photos";

/**
 * Data for the share preview of a published invitation, read on the server so the
 * first HTML response already carries it (WhatsApp does not run JavaScript).
 * Uses the public anon key: the same RLS as the public page, so only published,
 * paid invitations are visible. Returns null when not found or on any error.
 */
export const getInvitationShareMeta = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().max(64) }))
  .handler(async ({ data }): Promise<Omit<ShareMetaInput, "guestName"> | null> => {
    const slug = data.slug.toLowerCase();
    if (!isValidSlug(slug)) return null;
    const { url, anonKey } = getSupabaseEnv();
    if (!url || !anonKey) return null;

    try {
      const supabase = createClient<Database>(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: row, error } = await supabase
        .from("invitations")
        .select(
          "id, content, partner_a_name, partner_b_name, wedding_date, venue_name, venue_address",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .eq("payment_status", "paid")
        .maybeSingle();
      if (error || !row) return null;

      const content = parseContent(row);
      const { data: photos } = await supabase
        .from("invitation_photos")
        .select("storage_path, role")
        .eq("invitation_id", row.id)
        .order("sort_order", { ascending: true });
      const path = pickShareImage(photos ?? []);
      const image = path
        ? supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
        : undefined;

      return {
        partnerA: content.partners.a,
        partnerB: content.partners.b,
        eventDates: content.events.map((e) => e.date),
        ...(image ? { image } : {}),
      };
    } catch (err) {
      console.error("share meta failed", err instanceof Error ? err.message : err);
      return null;
    }
  });
