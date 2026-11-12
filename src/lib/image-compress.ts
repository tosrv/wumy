/**
 * Shrinks photos in the browser before upload: caps the longest side and re-encodes
 * as WebP (JPEG where the browser can't encode WebP). Phone photos drop from several
 * MB to a few hundred KB, so invitation pages load fast on mobile data.
 */

export const MAX_PHOTO_DIMENSION = 2000;
export const PHOTO_QUALITY = 0.82;

/** Size to draw at so the longest side is at most `max`; never upscales. */
export function fitWithin(
  width: number,
  height: number,
  max: number = MAX_PHOTO_DIMENSION,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const scale = max / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** GIFs keep their animation, so they are uploaded as-is. */
export function shouldCompress(type: string): boolean {
  return type === "image/jpeg" || type === "image/png" || type === "image/webp";
}

/** `photo.jpg` → `photo.webp`. */
export function renameExtension(name: string, type: string): string {
  const ext = type === "image/webp" ? "webp" : type === "image/jpeg" ? "jpg" : "png";
  const base = name.replace(/\.[^./\\]+$/, "") || "photo";
  return `${base}.${ext}`;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Returns a smaller WebP/JPEG version of `file`, or the original when it can't be
 * processed or the result wouldn't be smaller. Never throws.
 */
export async function compressPhoto(file: File): Promise<File> {
  if (!shouldCompress(file.type) || typeof createImageBitmap !== "function") return file;

  try {
    // `from-image` applies EXIF rotation so phone photos aren't sideways.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let blob = await canvasToBlob(canvas, "image/webp", PHOTO_QUALITY);
    // Browsers that can't encode WebP silently return PNG; use JPEG there instead.
    if (!blob || blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, "image/jpeg", PHOTO_QUALITY);
    }
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], renameExtension(file.name, blob.type), {
      type: blob.type,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}
