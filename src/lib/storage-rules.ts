/**
 * Storage buckets, limits, and path rules shared by the browser and the server.
 *
 * Paths follow `{ownerId}/{invitationId}/{filename}`. With Supabase Storage the same rules
 * are enforced by storage policies in `supabase/schema.sql`; with Cloudflare R2 they are
 * enforced by the server functions in `src/server/storage/functions.ts`.
 */

export const PHOTO_BUCKET = "invitation-photos";
export const MUSIC_BUCKET = "invitation-music";

export type StorageBucket = typeof PHOTO_BUCKET | typeof MUSIC_BUCKET;

export const BUCKET_RULES: Record<StorageBucket, { maxBytes: number; contentTypes: string[] }> = {
  [PHOTO_BUCKET]: {
    maxBytes: 5 * 1024 * 1024,
    contentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  [MUSIC_BUCKET]: {
    maxBytes: 10 * 1024 * 1024,
    contentTypes: ["audio/mpeg"],
  },
};

export function isStorageBucket(value: string): value is StorageBucket {
  return value === PHOTO_BUCKET || value === MUSIC_BUCKET;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FILENAME_RE = /^[A-Za-z0-9._-]{1,200}$/;

/** Owner and invitation of an object path, or null when the path is malformed. */
export function parseObjectPath(path: string): { ownerId: string; invitationId: string } | null {
  const parts = path.split("/");
  if (parts.length !== 3) return null;
  const [ownerId, invitationId, fileName] = parts as [string, string, string];
  if (!UUID_RE.test(ownerId) || !UUID_RE.test(invitationId)) return null;
  if (!FILENAME_RE.test(fileName) || fileName === "." || fileName === "..") return null;
  return { ownerId, invitationId };
}

/** Folder of one invitation's files, or null when the ids are malformed. */
export function parseObjectFolder(
  folder: string,
): { ownerId: string; invitationId: string } | null {
  const parts = folder.split("/");
  if (parts.length !== 2) return null;
  const [ownerId, invitationId] = parts as [string, string];
  if (!UUID_RE.test(ownerId) || !UUID_RE.test(invitationId)) return null;
  return { ownerId, invitationId };
}

/** R2 keeps both buckets in one R2 bucket, prefixed by the logical bucket name. */
export function objectKey(bucket: StorageBucket, path: string): string {
  return `${bucket}/${path}`;
}
