import { contentDraftSchema } from "@/lib/invitation-content";
import { storageList, storagePublicUrl, storageRemove, storageUpload } from "@/lib/storage";
import { BUCKET_RULES, MUSIC_BUCKET } from "@/lib/storage-rules";

export { MUSIC_BUCKET };
export const MAX_MUSIC_BYTES = BUCKET_RULES[MUSIC_BUCKET].maxBytes;

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

export type MusicUpload = (path: string, file: File) => Promise<void>;

/** Internal (exported for tests). Old files are deleted by the editor only after a save drops them. */
export async function uploadMusicWith(
  upload: MusicUpload,
  invitationId: string,
  ownerId: string,
  file: File,
  now: number = Date.now(),
): Promise<{ path: string; fileName: string }> {
  const path = `${ownerId}/${invitationId}/music-${now}.mp3`;
  await upload(path, file);
  return { path, fileName: file.name };
}

export async function uploadInvitationMusic(
  invitationId: string,
  ownerId: string,
  file: File,
): Promise<{ path: string; fileName: string }> {
  return uploadMusicWith(
    (path, f) => storageUpload(MUSIC_BUCKET, path, f, "audio/mpeg"),
    invitationId,
    ownerId,
    file,
  );
}

export async function removeInvitationMusic(path: string): Promise<void> {
  await storageRemove(MUSIC_BUCKET, [path]);
}

/** Internal (exported for tests). Full paths of the files in `{owner}/{invitation}/`; [] on error. */
export async function listMusicWith(
  list: (folder: string) => Promise<string[]>,
  ownerId: string,
  invitationId: string,
): Promise<string[]> {
  try {
    return await list(`${ownerId}/${invitationId}`);
  } catch (err) {
    console.warn("Could not list music files:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function listInvitationMusic(
  ownerId: string,
  invitationId: string,
): Promise<string[]> {
  return listMusicWith((folder) => storageList(MUSIC_BUCKET, folder), ownerId, invitationId);
}

export function musicPublicUrl(path: string): string {
  return storagePublicUrl(MUSIC_BUCKET, path);
}

/** Storage path of an invitation's music file, or null when it has none (or the stored content is invalid). */
export function musicPathForCleanup(content: unknown): string | null {
  return contentDraftSchema.parse(content).music?.path ?? null;
}
