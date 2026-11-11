import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ImagePlus, Star } from "lucide-react";
import { MAX_INVITATION_PHOTOS, type InvitationPhotoRow } from "@/lib/invitations";
import { t } from "@/lib/editor-i18n";
import { cn } from "@/lib/utils";
import type { EditorFormValues } from "@/components/editor/editor-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, StepShell } from "./StepShell";

const STORY_MAX = 500;

interface GalleryStepProps {
  photos: InvitationPhotoRow[];
  photoUrls: string[];
  coverPhoto?: InvitationPhotoRow | undefined;
  coverUrl?: string | undefined;
  loading: boolean;
  busy: boolean;
  onAdd: (files: FileList | null) => void;
  onRemove: (photo: InvitationPhotoRow) => void;
  onMakeCover: (photo: InvitationPhotoRow) => void;
  onClearCover: (photo: InvitationPhotoRow) => void;
  onCaption: (photo: InvitationPhotoRow, caption: string) => void;
}

function CaptionInput({
  photo,
  label,
  disabled,
  onCommit,
}: {
  photo: InvitationPhotoRow;
  label: string;
  disabled: boolean;
  onCommit: (caption: string) => void;
}) {
  const [value, setValue] = useState(photo.caption ?? "");
  return (
    <Input
      aria-label={label}
      placeholder={label}
      value={value}
      disabled={disabled}
      maxLength={120}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value.trim() !== (photo.caption ?? "").trim()) onCommit(value);
      }}
      className="h-9 rounded-lg bg-background text-xs"
    />
  );
}

export function GalleryStep({
  photos,
  photoUrls,
  coverPhoto,
  coverUrl,
  loading,
  busy,
  onAdd,
  onRemove,
  onMakeCover,
  onClearCover,
  onCaption,
}: GalleryStepProps) {
  const { control, register } = useFormContext<EditorFormValues>();
  const locale = useWatch({ control, name: "locale" });
  const story = useWatch({ control, name: "story" });
  const full = photos.length >= MAX_INVITATION_PHOTOS;
  // Clearing the cover returns it to the gallery, which must stay within the cap.
  const clearCoverBlocked = full;

  return (
    <StepShell
      icon={<ImagePlus className="size-5 text-primary" />}
      title={t(locale, "galleryStep")}
    >
      <section className="flex flex-col gap-2">
        <span className="text-xs font-bold">{t(locale, "coverBadge")}</span>
        {coverPhoto ? (
          <div className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
            <img
              src={coverUrl}
              alt={coverPhoto.caption || t(locale, "coverBadge")}
              className="size-20 rounded-lg object-cover"
            />
            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy || clearCoverBlocked}
                onClick={() => onClearCover(coverPhoto)}
                className="self-start rounded-xl"
              >
                {t(locale, "clearCover")}
              </Button>
              {clearCoverBlocked && (
                <p className="text-[11px] text-muted-foreground">
                  {t(locale, "clearCoverBlocked")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-secondary/50 px-4 py-4 text-center text-xs text-muted-foreground">
            {t(locale, "coverEmpty")}
          </p>
        )}
      </section>

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40 px-6 py-10 text-center transition-colors hover:bg-secondary/70",
          (busy || full) && "pointer-events-none opacity-50",
        )}
      >
        <ImagePlus className="mb-3 size-8 text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground">
          {full ? t(locale, "galleryFull") : t(locale, "galleryHint")}
        </p>
        <span className="mt-4 inline-flex rounded-xl bg-card px-4 py-2 text-xs font-semibold shadow-sm">
          {busy ? t(locale, "uploading") : t(locale, "uploadPhotos")}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          disabled={busy || full}
          onChange={(e) => {
            onAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold">{t(locale, "stepGallery")}</span>
        <span className="text-[11px] font-bold text-muted-foreground">
          {photos.length}/{MAX_INVITATION_PHOTOS}
        </span>
      </div>

      {loading && <p className="text-sm text-muted-foreground">{t(locale, "galleryLoading")}</p>}

      {!loading && photos.length === 0 && (
        <p className="rounded-xl bg-secondary/50 px-4 py-8 text-center text-sm text-muted-foreground">
          {t(locale, "galleryEmpty")}
        </p>
      )}

      {!loading && photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id} className="flex flex-col gap-2">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <img
                  src={photoUrls[index]}
                  alt={photo.caption || `${t(locale, "photo")} ${index + 1}`}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRemove(photo)}
                  className="absolute right-2 top-2 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background disabled:opacity-50"
                >
                  {t(locale, "removePhoto")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onMakeCover(photo)}
                  className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-bold backdrop-blur-sm disabled:opacity-50"
                >
                  <Star className="size-3" />
                  {t(locale, "makeCover")}
                </button>
              </div>
              <CaptionInput
                photo={photo}
                label={t(locale, "caption")}
                disabled={busy}
                onCommit={(caption) => onCaption(photo, caption)}
              />
            </li>
          ))}
        </ul>
      )}

      <Field label={`${t(locale, "story")} (${story.length}/${STORY_MAX})`} htmlFor="story-text">
        <textarea
          id="story-text"
          rows={6}
          maxLength={STORY_MAX}
          placeholder={t(locale, "storyPlaceholder")}
          className="min-h-32 w-full resize-y rounded-xl bg-background px-3.5 py-3 text-sm leading-relaxed shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          {...register("story")}
        />
      </Field>
    </StepShell>
  );
}
