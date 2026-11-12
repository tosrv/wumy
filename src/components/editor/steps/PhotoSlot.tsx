import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  MAX_PHOTO_INPUT_BYTES,
  publicPhotoUrl,
  replaceInvitationPhotoFile,
  uploadInvitationPhotos,
  type InvitationPhotoRow,
} from "@/lib/invitations";
import { editorErrorText, t } from "@/lib/editor-i18n";
import type { Locale } from "@/lib/invitation-content";
import { cn } from "@/lib/utils";

interface PhotoSlotProps {
  invitationId: string;
  role: "partner_a" | "partner_b" | "cover";
  photo?: InvitationPhotoRow | undefined;
  /** Called after the photo is uploaded and assigned its role, so the parent can reload photos. */
  onChange: () => void;
  locale?: Locale;
  label?: string;
}

/**
 * Single-photo slot. The upload is assigned its role immediately, so it never
 * occupies a gallery slot (the previous holder of the role returns to the gallery).
 */
export function PhotoSlot({
  invitationId,
  role,
  photo,
  onChange,
  locale = "id",
  label,
}: PhotoSlotProps) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!user) {
      setError(t(locale, "photoUploadFailed"));
      return;
    }
    if (file.size > MAX_PHOTO_INPUT_BYTES) {
      setError(t(locale, "photoTooLarge"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (photo) {
        // Replacing keeps the slot's row and swaps its file, so no extra row is
        // created (the database caps photos per invitation).
        await replaceInvitationPhotoFile(user.id, invitationId, photo, file);
      } else {
        await uploadInvitationPhotos(user.id, invitationId, [file], role);
      }
      onChange();
    } catch (err) {
      setError(editorErrorText(err, locale, "photoUploadFailed"));
      onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={cn(
          "relative flex size-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/40 text-center transition-colors hover:bg-secondary/70 focus-within:ring-2 focus-within:ring-accent",
          busy && "pointer-events-none opacity-50",
        )}
      >
        {photo ? (
          <img
            src={publicPhotoUrl(photo.storage_path)}
            alt={label ?? ""}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex flex-col items-center gap-1 px-2 text-[11px] font-semibold text-muted-foreground">
            <ImagePlus className="size-5" />
            {busy ? t(locale, "uploading") : t(locale, "uploadPhoto")}
          </span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          aria-label={label ?? t(locale, "uploadPhoto")}
          disabled={busy}
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {photo && (
        <span className="text-[11px] text-muted-foreground">
          {busy ? t(locale, "uploading") : t(locale, "replacePhoto")}
        </span>
      )}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
