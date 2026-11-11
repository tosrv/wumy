import { contentDraftSchema } from "@/lib/invitation-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const MAX_MUSIC_BYTES = 10 * 1024 * 1024;
export const MUSIC_BUCKET = "invitation-music";

export function validateMusicFile(file: {
  type: string;
  size: number;
  name: string;
}): "type" | "size" | null {
  const isMp3 = file.type === "audio/mpeg" || (!file.type && /\.mp3$/i.test(file.name));
  if (!isMp3) return "type";
  if (file.size > MAX_MUSIC_BYTES) return "size";
  return null;
}

/** The slice of the Supabase client these helpers use (lets tests inject a stub). */
export type MusicStorageClient = {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        file: File,
        options: { cacheControl: string; upsert: boolean; contentType: string },
      ): PromiseLike<{ error: { message: string } | null }>;
      remove(paths: string[]): PromiseLike<{ error: { message: string } | null }>;
    };
  };
};

/** Internal (exported for tests). Old files are deleted by the editor only after a save drops them. */
export async function uploadMusicWith(
  client: MusicStorageClient,
  invitationId: string,
  ownerId: string,
  file: File,
  now: number = Date.now(),
): Promise<{ path: string; fileName: string }> {
  const bucket = client.storage.from(MUSIC_BUCKET);
  const path = `${ownerId}/${invitationId}/music-${now}.mp3`;

  const { error } = await bucket.upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: "audio/mpeg",
  });
  if (error) throw new Error(error.message);

  return { path, fileName: file.name };
}

export async function uploadInvitationMusic(
  invitationId: string,
  ownerId: string,
  file: File,
): Promise<{ path: string; fileName: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return uploadMusicWith(supabase, invitationId, ownerId, file);
}

export async function removeInvitationMusic(path: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.storage.from(MUSIC_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

/** The slice of the Supabase client used to list a music folder. */
export type MusicListClient = {
  storage: {
    from(bucket: string): {
      list(
        folder: string,
        options: { limit: number },
      ): PromiseLike<{ data: { name: string }[] | null; error: { message: string } | null }>;
    };
  };
};

/** Internal (exported for tests). Full paths of the files in `{owner}/{invitation}/`; [] on error. */
export async function listMusicWith(
  client: MusicListClient,
  ownerId: string,
  invitationId: string,
): Promise<string[]> {
  const folder = `${ownerId}/${invitationId}`;
  const { data, error } = await client.storage.from(MUSIC_BUCKET).list(folder, { limit: 100 });
  if (error || !data) {
    console.warn("Could not list music files:", error?.message);
    return [];
  }
  return data.map((f) => `${folder}/${f.name}`);
}

export async function listInvitationMusic(
  ownerId: string,
  invitationId: string,
): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  return listMusicWith(supabase, ownerId, invitationId);
}

export function musicPublicUrl(path: string): string {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return "";
  const { data } = supabase.storage.from(MUSIC_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Storage path of an invitation's music file, or null when it has none (or the stored content is invalid). */
export function musicPathForCleanup(content: unknown): string | null {
  return contentDraftSchema.parse(content).music?.path ?? null;
}
