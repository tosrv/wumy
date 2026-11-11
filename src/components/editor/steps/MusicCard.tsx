import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Music } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { t, type EditorStringKey } from "@/lib/editor-i18n";
import { musicPublicUrl, uploadInvitationMusic, validateMusicFile } from "@/lib/invitation-music";
import { clampStart, formatMmSs, parseMmSs } from "@/components/editor/music-time";
import type { EditorFormValues } from "@/components/editor/editor-form";
import { Button } from "@/components/ui/button";
import { inputClass } from "./StepShell";

const MAX_START_SECONDS = 600;

export function MusicCard({
  invitationId,
  onMusicReplaced,
}: {
  invitationId: string;
  /** Registers a file the form no longer references; the editor deletes it once a save is written. */
  onMusicReplaced: (oldPath: string) => void;
}) {
  const { control, setValue } = useFormContext<EditorFormValues>();
  const locale = useWatch({ control, name: "locale" });
  const music = useWatch({ control, name: "music" });
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<EditorStringKey | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [startText, setStartText] = useState(formatMmSs(music?.startSeconds ?? 0));

  const path = music?.path;
  const startSeconds = music?.startSeconds ?? 0;
  const url = path ? musicPublicUrl(path) : "";

  // A new track has an unknown duration until its metadata loads.
  useEffect(() => {
    setDuration(null);
  }, [path]);

  useEffect(() => {
    setStartText(formatMmSs(startSeconds));
  }, [startSeconds]);

  /** Normalises a start value to an integer within 0..600 (and the track, when its length is known). */
  function normaliseStart(seconds: number, knownDuration: number | null): number {
    const capped = Math.min(Math.floor(seconds), MAX_START_SECONDS);
    return knownDuration === null ? capped : clampStart(capped, knownDuration);
  }

  function writeStart(seconds: number) {
    if (!music) return;
    setValue("music", { ...music, startSeconds: seconds }, { shouldDirty: true });
    setStartText(formatMmSs(seconds));
  }

  function commitStart() {
    const parsed = parseMmSs(startText);
    if (parsed === null) {
      setErrorKey("musicStartFormat");
      return;
    }
    const next = normaliseStart(parsed, duration);
    setErrorKey(next < Math.min(parsed, MAX_START_SECONDS) ? "musicStartPastEnd" : null);
    writeStart(next);
  }

  function handleMetadata(e: React.SyntheticEvent<HTMLAudioElement>) {
    const d = e.currentTarget.duration;
    if (!Number.isFinite(d)) return;
    setDuration(d);
    const clamped = clampStart(startSeconds, d);
    if (clamped !== startSeconds) {
      setErrorKey("musicStartPastEnd");
      writeStart(clamped);
    }
  }

  function useCurrentPosition() {
    const audio = audioRef.current;
    if (!audio) return;
    setErrorKey(null);
    writeStart(normaliseStart(audio.currentTime, duration));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const invalid = validateMusicFile(file);
    if (invalid) {
      setErrorKey(invalid === "type" ? "musicOnlyMp3" : "musicTooLarge");
      return;
    }
    if (!user) {
      setErrorKey("musicUploadFailed");
      return;
    }
    setBusy(true);
    setErrorKey(null);
    try {
      const previousPath = music?.path;
      const uploaded = await uploadInvitationMusic(invitationId, user.id, file);
      if (previousPath) onMusicReplaced(previousPath);
      setValue(
        "music",
        { path: uploaded.path, fileName: uploaded.fileName, startSeconds: 0 },
        { shouldDirty: true },
      );
    } catch {
      setErrorKey("musicUploadFailed");
    } finally {
      setBusy(false);
    }
  }

  function handleRemove() {
    if (!music) return;
    setErrorKey(null);
    onMusicReplaced(music.path);
    setValue("music", undefined, { shouldDirty: true });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-secondary/40 p-4">
      <div className="flex items-center gap-2">
        <Music className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">{t(locale, "musicTitle")}</h3>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,.mp3"
        className="sr-only"
        aria-label={music ? t(locale, "musicReplace") : t(locale, "musicUpload")}
        disabled={busy}
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {music ? (
        <>
          <p className="truncate text-sm" title={music.fileName}>
            {music.fileName}
          </p>
          {url && (
            <audio
              key={url}
              ref={audioRef}
              src={url}
              controls
              preload="metadata"
              className="w-full"
              onLoadedMetadata={handleMetadata}
            />
          )}
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="music-start" className="text-xs font-semibold text-muted-foreground">
                {t(locale, "musicStart")}
              </label>
              <input
                id="music-start"
                inputMode="numeric"
                className={`${inputClass} w-24`}
                value={startText}
                disabled={busy}
                onChange={(e) => setStartText(e.target.value)}
                onBlur={commitStart}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitStart();
                  }
                }}
              />
            </div>
            {url && (
              <Button type="button" variant="outline" disabled={busy} onClick={useCurrentPosition}>
                {t(locale, "musicUseCurrent")}
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
            >
              {t(locale, "musicReplace")}
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={handleRemove}>
              {t(locale, "musicRemove")}
            </Button>
          </div>
        </>
      ) : (
        <div>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            {t(locale, "musicUpload")}
          </Button>
        </div>
      )}

      {errorKey && (
        <p role="alert" className="text-[11px] text-destructive">
          {t(locale, errorKey)}
        </p>
      )}
    </div>
  );
}
