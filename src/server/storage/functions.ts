import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  BUCKET_RULES,
  isStorageBucket,
  objectKey,
  parseObjectFolder,
  parseObjectPath,
  type StorageBucket,
} from "@/lib/storage-rules";

// Server-only modules are imported inside the handlers so the R2 secret and the
// service-role client are never pulled into the client bundle.

const bucketSchema = z.string().refine(isStorageBucket, "Unknown bucket");

/**
 * Same rule as the Supabase storage policies: the caller must own the invitation
 * named in the path, and the path's first segment must be the caller's id.
 */
async function authorize(accessToken: string, target: { ownerId: string; invitationId: string }) {
  const { readR2Config } = await import("./config");
  const cfg = readR2Config(process.env);
  if (!cfg) throw new Error("Storage is not configured");

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(cfg.supabaseUrl, cfg.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error } = await admin.auth.getUser(accessToken);
  const userId = userData.user?.id;
  if (error || !userId || userId !== target.ownerId) throw new Error("Unauthorized");

  const { data: invitation, error: invError } = await admin
    .from("invitations")
    .select("id")
    .eq("id", target.invitationId)
    .eq("owner_id", userId)
    .maybeSingle();
  if (invError || !invitation) throw new Error("Unauthorized");

  const { createR2 } = await import("./r2");
  return createR2(cfg);
}

export const createUploadUrl = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string().min(1),
      bucket: bucketSchema,
      path: z.string().max(400),
      contentType: z.string().max(100),
      size: z.number().int().positive(),
    }),
  )
  .handler(async ({ data }): Promise<{ url: string; headers: Record<string, string> }> => {
    const bucket = data.bucket as StorageBucket;
    const target = parseObjectPath(data.path);
    if (!target) throw new Error("Invalid path");
    const rules = BUCKET_RULES[bucket];
    if (!rules.contentTypes.includes(data.contentType)) throw new Error("File type not allowed");
    if (data.size > rules.maxBytes) throw new Error("File is too large");

    const r2 = await authorize(data.accessToken, target);
    const url = await r2.presignPut(objectKey(bucket, data.path), data.contentType, data.size);
    return {
      url,
      headers: {
        "Content-Type": data.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    };
  });

export const removeObjects = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string().min(1),
      bucket: bucketSchema,
      paths: z.array(z.string().max(400)).max(100),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const bucket = data.bucket as StorageBucket;
    const targets = data.paths.map(parseObjectPath);
    if (targets.some((t) => !t)) throw new Error("Invalid path");
    // Authorize each distinct invitation folder once.
    const seen = new Map<string, Awaited<ReturnType<typeof authorize>>>();
    for (const [i, target] of targets.entries()) {
      const t = target!;
      const folder = `${t.ownerId}/${t.invitationId}`;
      let r2 = seen.get(folder);
      if (!r2) {
        r2 = await authorize(data.accessToken, t);
        seen.set(folder, r2);
      }
      await r2.remove(objectKey(bucket, data.paths[i]!));
    }
  });

export const listObjects = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string().min(1),
      bucket: bucketSchema,
      folder: z.string().max(200),
    }),
  )
  .handler(async ({ data }): Promise<string[]> => {
    const bucket = data.bucket as StorageBucket;
    const target = parseObjectFolder(data.folder);
    if (!target) throw new Error("Invalid folder");
    const r2 = await authorize(data.accessToken, target);
    const prefix = `${objectKey(bucket, data.folder)}/`;
    const keys = await r2.list(prefix);
    return keys.map((key) => key.slice(`${bucket}/`.length));
  });
