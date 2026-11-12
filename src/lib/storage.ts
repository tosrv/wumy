/**
 * File storage used by the editor: Supabase Storage by default, Cloudflare R2 when
 * VITE_STORAGE_PUBLIC_URL is set (production). Both use the same buckets and paths
 * (see `storage-rules.ts`), so callers don't care which backend is active.
 */
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { StorageBucket } from "@/lib/storage-rules";

/** Public base URL of the R2 bucket (custom domain), e.g. https://media.wumy.my.id. */
export function getStoragePublicBase(): string {
  const base = import.meta.env["VITE_STORAGE_PUBLIC_URL"] as string | undefined;
  return base?.trim().replace(/\/+$/, "") ?? "";
}

export function isR2Storage(): boolean {
  return getStoragePublicBase() !== "";
}

/** Public URL of a stored object. */
export function storagePublicUrl(bucket: StorageBucket, path: string): string {
  const base = getStoragePublicBase();
  if (base) return `${base}/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return "";
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function accessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in.");
  return token;
}

export async function storageUpload(
  bucket: StorageBucket,
  path: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  if (isR2Storage()) {
    const { createUploadUrl } = await import("@/server/storage/functions");
    const { url, headers } = await createUploadUrl({
      data: { accessToken: await accessToken(), bucket, path, contentType, size: file.size },
    });
    const res = await fetch(url, { method: "PUT", headers, body: file });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    return;
  }
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType,
  });
  if (error) throw new Error(error.message);
}

export async function storageRemove(bucket: StorageBucket, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  if (isR2Storage()) {
    const { removeObjects } = await import("@/server/storage/functions");
    await removeObjects({ data: { accessToken: await accessToken(), bucket, paths } });
    return;
  }
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw new Error(error.message);
}

/** Full paths of the files in `{owner}/{invitation}`. */
export async function storageList(bucket: StorageBucket, folder: string): Promise<string[]> {
  if (isR2Storage()) {
    const { listObjects } = await import("@/server/storage/functions");
    return listObjects({ data: { accessToken: await accessToken(), bucket, folder } });
  }
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 100 });
  if (error || !data) throw new Error(error?.message ?? "List failed");
  return data.map((f) => `${folder}/${f.name}`);
}
