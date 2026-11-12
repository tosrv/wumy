import { track } from "@/lib/analytics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { getTemplateById } from "@/data/templates";
import {
  MAX_INVITATION_PHOTOS,
  MAX_PHOTO_INPUT_BYTES,
  deleteInvitation,
  deleteInvitationPhoto,
  listInvitationPhotos,
  publicPhotoUrl,
  publishInvitation,
  setPhotoRole,
  updatePhotoCaption,
  isSlugLocked,
  updateInvitation,
  uploadInvitationPhotos,
  type InvitationPhotoRow,
  type InvitationRow,
} from "@/lib/invitations";
import { photoRoleSchema } from "@/lib/invitation-content";
import { editorErrorText, t } from "@/lib/editor-i18n";
import {
  contentFromValues,
  editorFormSchema,
  toDetailsInput,
  toFormValues,
  type EditorFormValues,
} from "@/components/editor/editor-form";
import {
  listInvitationMusic,
  musicPathForCleanup,
  removeInvitationMusic,
} from "@/lib/invitation-music";
import { orphanedMusicPaths, pathsSafeToDelete } from "@/components/editor/music-cleanup";
import { useAutosave } from "@/components/editor/useAutosave";
import { partnerFallbackNames, viewModelFromContent } from "@/components/invitations/types";
import { EditorShell } from "@/components/editor/EditorShell";
import {
  EDITOR_STEPS,
  EditorStatusBar,
  type EditorStepId,
} from "@/components/editor/sections/EditorStepHeader";
import { EditorAccordion } from "@/components/editor/sections/EditorAccordion";
import { editorSectionDomId, stepStates, stepSummary } from "@/components/editor/step-states";
import { EditorPreviewPane, EditorThemeStep } from "@/components/editor/sections/EditorPreviewPane";
import { PartnersStep } from "@/components/editor/steps/PartnersStep";
import { EventsStep } from "@/components/editor/steps/EventsStep";
import { GalleryStep } from "@/components/editor/steps/GalleryStep";
import { GiftsStep } from "@/components/editor/steps/GiftsStep";
import { TextsStep } from "@/components/editor/steps/TextsStep";
import { ReviewStep } from "@/components/editor/steps/ReviewStep";
import { collectPublishIssues, isLiveSaveBlocked } from "@/components/editor/publish-issues";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditorPageProps {
  userId: string;
  invitation: InvitationRow;
}

/** Fire once per editor visit. */
function useTrackEditorOpen(templateId: string) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track("editor_open", { template: templateId });
  }, [templateId]);
}

export function EditorPage({ userId, invitation }: EditorPageProps) {
  useTrackEditorOpen(invitation.template_id);
  const router = useRouter();
  const form = useForm<EditorFormValues>({
    defaultValues: toFormValues(invitation),
  });
  const { control, setValue, getValues } = form;
  // Without `name`, useWatch returns the whole (always fully populated) form value.
  const values = useWatch({ control }) as EditorFormValues;
  const { templateId, slug, story, locale } = values;
  const publishIssues = useMemo(() => collectPublishIssues(values), [values]);
  const partnerAName = values.partners.a.nickname;
  const partnerBName = values.partners.b.nickname;

  // The open editor section lives in the URL (?step=events) so a refresh keeps it.
  const { step: openStep } = useSearch({ from: "/editor/$invitationId" });
  const navigate = useNavigate({ from: "/editor/$invitationId" });
  const setOpenStep = useCallback(
    (step: EditorStepId | undefined) => {
      void navigate({ search: (prev) => ({ ...prev, step }), replace: true });
    },
    [navigate],
  );
  const [device, setDevice] = useState<"mobile" | "web">("mobile");
  const [photos, setPhotos] = useState<InvitationPhotoRow[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [status, setStatus] = useState(invitation.status);
  const [publishedAt, setPublishedAt] = useState(invitation.published_at);
  const slugLocked = isSlugLocked({ published_at: publishedAt });
  const slugLockedRef = useRef(slugLocked);
  slugLockedRef.current = slugLocked;
  const [dangerBusy, setDangerBusy] = useState(false);
  // A live invitation's save is held while its content fails the publish check.
  const [liveSaveHeld, setLiveSaveHeld] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  // Mirrors `slugError` synchronously so publish can see the result of the save it just made.
  const slugErrorRef = useRef<string | null>(null);
  const statusRef = useRef(status);
  // Music files dropped from the form; deleted only after a save that no longer references them.
  const pendingMusicDeletes = useRef<string[]>([]);
  const onMusicReplaced = useCallback((oldPath: string) => {
    if (!pendingMusicDeletes.current.includes(oldPath)) pendingMusicDeletes.current.push(oldPath);
  }, []);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Every music path that may still be referenced: the row as loaded, the last
  // successful write, and the current form value (a fresh upload not yet saved).
  const savedMusicPathRef = useRef<string | null>(musicPathForCleanup(invitation.content));
  const formMusicPathRef = useRef<string | undefined>(undefined);
  formMusicPathRef.current = values.music?.path;

  // Once per editor visit, remove music files left behind when an earlier session
  // replaced or removed a track but closed before the save that dropped it.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const listed = await listInvitationMusic(invitation.owner_id, invitation.id);
      if (cancelled) return;
      const orphans = orphanedMusicPaths(listed, [
        savedMusicPathRef.current ?? undefined,
        formMusicPathRef.current,
      ]);
      for (const path of orphans) {
        removeInvitationMusic(path).catch((e: unknown) =>
          console.warn("Could not remove orphaned music:", e),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [invitation.id, invitation.owner_id]);

  const template = getTemplateById(templateId);
  const [fallbackA, fallbackB] = partnerFallbackNames(values.locale);
  const coupleLabel = `${partnerAName.trim() || fallbackA} & ${partnerBName.trim() || fallbackB}`;

  const reloadPhotos = useCallback(async () => {
    try {
      setPhotos(await listInvitationPhotos(invitation.id));
    } catch (err) {
      setError(editorErrorText(err, locale, "photosLoadFailed"));
    }
  }, [invitation.id, locale]);

  // Read through a ref so switching the invitation language doesn't refetch photos.
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    let cancelled = false;
    setPhotosLoading(true);
    listInvitationPhotos(invitation.id)
      .then((rows) => {
        if (!cancelled) setPhotos(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(editorErrorText(err, localeRef.current, "photosLoadFailed"));
        }
      })
      .finally(() => {
        if (!cancelled) setPhotosLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invitation.id]);

  const photoUrls = useMemo(
    () => photos.map((photo) => publicPhotoUrl(photo.storage_path)),
    [photos],
  );

  const galleryPhotos = useMemo(() => photos.filter((p) => p.role === "gallery"), [photos]);
  const galleryPhotoUrls = useMemo(
    () => galleryPhotos.map((photo) => publicPhotoUrl(photo.storage_path)),
    [galleryPhotos],
  );

  const coverPhoto = useMemo(() => photos.find((p) => p.role === "cover"), [photos]);

  const viewModel = useMemo(
    () =>
      viewModelFromContent({
        templateId: templateId || "minimal",
        content: contentFromValues(values),
        story,
        photos: photos.map((photo, i) => ({
          url: photoUrls[i]!,
          role: photoRoleSchema.catch("gallery").parse(photo.role),
        })),
      }),
    [templateId, values, story, photos, photoUrls],
  );

  const saveValues = useCallback(
    async (v: EditorFormValues) => {
      const normalized = editorFormSchema.parse(v);
      if (isLiveSaveBlocked(statusRef.current, normalized)) {
        // Not written: the public page keeps the last valid content.
        setLiveSaveHeld(true);
        return;
      }
      setLiveSaveHeld(false);
      try {
        const content = contentFromValues(normalized);
        const { invitation: updated, slugError: slugIssue } = await updateInvitation(
          invitation.id,
          toDetailsInput(normalized),
          content,
          { slugLocked: slugLockedRef.current },
        );
        setStatus(updated.status);
        setPublishedAt(updated.published_at);
        savedMusicPathRef.current = content.music?.path ?? null;
        const deletable = pathsSafeToDelete(pendingMusicDeletes.current, content.music?.path);
        pendingMusicDeletes.current = pendingMusicDeletes.current.filter(
          (p) => !deletable.includes(p),
        );
        for (const path of deletable) {
          removeInvitationMusic(path).catch((e: unknown) =>
            console.warn("Could not remove old music:", e),
          );
        }
        slugErrorRef.current =
          slugIssue === "invalid"
            ? t(normalized.locale, "issueSlug")
            : slugIssue === "reserved"
              ? t(normalized.locale, "slugReserved")
              : slugIssue === "taken"
                ? t(normalized.locale, "slugTaken")
                : null;
        setSlugError(slugErrorRef.current);
        setError(null);
      } catch (err) {
        // Form state is kept; the error is shown and the next change retries.
        setError(editorErrorText(err, normalized.locale, "saveFailed"));
        throw err;
      }
    },
    [invitation.id],
  );

  const autosave = useAutosave({
    value: values,
    save: saveValues,
  });

  const saveStatusText = liveSaveHeld
    ? ""
    : autosave.state === "saving"
      ? t(locale, "saving")
      : autosave.state === "saved"
        ? t(locale, "saved")
        : autosave.state === "error"
          ? t(locale, "saveFailed")
          : "";

  async function handleSave() {
    if (!templateId) {
      setError(t(locale, "pickTemplate"));
      return;
    }
    if (!partnerAName.trim() || !partnerBName.trim()) {
      setError(t(locale, "namesRequired"));
      return;
    }
    if (isLiveSaveBlocked(status, getValues())) {
      setLiveSaveHeld(true);
      setError(t(locale, "liveSaveHeld"));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (await autosave.saveNow(getValues())) setSuccess(t(locale, "draftSaved"));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    const galleryCount = photos.filter((p) => p.role === "gallery").length;
    const remaining = MAX_INVITATION_PHOTOS - galleryCount;
    if (remaining <= 0) {
      setError(t(locale, "photoCapReached", { n: MAX_INVITATION_PHOTOS }));
      return;
    }
    const nextFiles = Array.from(files).slice(0, remaining);
    const tooBig = nextFiles.find((file) => file.size > MAX_PHOTO_INPUT_BYTES);
    if (tooBig) {
      setError(t(locale, "photoTooLarge"));
      return;
    }

    setPhotoBusy(true);
    setError(null);
    try {
      const created = await uploadInvitationPhotos(userId, invitation.id, nextFiles);
      setPhotos((current) => [...current, ...created]);
      setSuccess(
        created.length === 1
          ? t(locale, "photoUploaded")
          : t(locale, "photosUploaded", { n: created.length }),
      );
    } catch (err) {
      setError(editorErrorText(err, locale, "photoUploadFailed"));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleRemovePhoto(photo: InvitationPhotoRow) {
    setPhotoBusy(true);
    setError(null);
    try {
      await deleteInvitationPhoto(photo);
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      setSuccess(t(locale, "photoRemoved"));
    } catch (err) {
      setError(editorErrorText(err, locale, "photoRemoveFailed"));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function runPhotoAction(action: () => Promise<void>) {
    setPhotoBusy(true);
    setError(null);
    try {
      await action();
      await reloadPhotos();
    } catch (err) {
      setError(editorErrorText(err, locale, "photoActionFailed"));
    } finally {
      setPhotoBusy(false);
    }
  }

  function handleClearCover(photo: InvitationPhotoRow) {
    if (galleryPhotos.length >= MAX_INVITATION_PHOTOS) {
      setError(t(locale, "clearCoverBlocked"));
      return;
    }
    void runPhotoAction(() => setPhotoRole(invitation.id, photo.id, "gallery"));
  }

  async function handleDelete() {
    setDangerBusy(true);
    setError(null);
    try {
      await deleteInvitation(invitation.id);
      void router.navigate({ to: "/dashboard" });
    } catch (err) {
      setError(editorErrorText(err, locale, "deleteFailed"));
      setDangerBusy(false);
    }
  }

  async function handlePublish() {
    if (!templateId) {
      setError(t(locale, "pickTemplate"));
      return;
    }
    if (!partnerAName.trim() || !partnerBName.trim()) {
      setError(t(locale, "namesRequired"));
      return;
    }
    const issues = collectPublishIssues(getValues());
    if (issues.length > 0) {
      setError(t(locale, issues[0]!.key));
      setOpenStep(issues[0]!.step);
      return;
    }

    setPublishing(true);
    setError(null);
    setSuccess(null);
    try {
      if (!(await autosave.saveNow(getValues()))) return;
      if (slugErrorRef.current) {
        setError(slugErrorRef.current);
        setOpenStep("review");
        return;
      }

      const published = await publishInvitation(invitation.id);
      setStatus(published.status);
      setPublishedAt(published.published_at);
      setSuccess(t(locale, "publishSuccess", { slug: published.slug }));
      track("published");
    } catch (err) {
      setError(editorErrorText(err, locale, "publishFailed"));
    } finally {
      setPublishing(false);
    }
  }

  const canPublish =
    Boolean(templateId) &&
    Boolean(partnerAName.trim()) &&
    Boolean(partnerBName.trim()) &&
    publishIssues.length === 0 &&
    !saving &&
    !publishing;

  useEffect(() => {
    if (!openStep) return;
    const el = document.getElementById(editorSectionDomId(openStep));
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Wait for the previous section to collapse before scrolling.
    const timer = window.setTimeout(
      () => el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }),
      reduce ? 0 : 220,
    );
    return () => window.clearTimeout(timer);
  }, [openStep]);

  const states = stepStates(values, { issues: publishIssues, galleryCount: galleryPhotos.length });
  const summaryCtx = {
    galleryCount: galleryPhotos.length,
    locale,
    ...(template ? { templateName: template.name } : {}),
  };
  const summaries = Object.fromEntries(
    EDITOR_STEPS.map((s) => [s.id, stepSummary(s.id, values, summaryCtx)]),
  ) as Record<EditorStepId, string>;

  return (
    <FormProvider {...form}>
      <EditorShell
        coupleLabel={coupleLabel}
        status={status}
        slug={slug}
        saving={saving || publishing}
        canPublish={canPublish}
        onSave={() => void handleSave()}
        onPublish={() => void handlePublish()}
      >
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="relative flex w-full flex-col justify-between overflow-hidden bg-secondary/40 lg:h-[calc(100svh-4rem)] lg:w-[52%]">
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 lg:p-8">
              <EditorStatusBar
                saveStatus={saveStatusText}
                warning={
                  liveSaveHeld ? (
                    <button
                      type="button"
                      className="text-left underline-offset-2 hover:underline"
                      onClick={() => setOpenStep("review")}
                    >
                      {t(locale, "liveSaveHeld")}
                    </button>
                  ) : undefined
                }
              />

              <EditorAccordion
                locale={locale}
                openStep={openStep}
                onOpenStepChange={setOpenStep}
                states={states}
                summaries={summaries}
                renderSection={(stepId) => (
                  <>
                    {stepId === "template" && (
                      <EditorThemeStep
                        templateId={templateId}
                        onSelect={(id) => setValue("templateId", id, { shouldDirty: true })}
                        partnerAName={partnerAName}
                        partnerBName={partnerBName}
                      />
                    )}

                    {stepId === "partners" && (
                      <PartnersStep
                        invitationId={invitation.id}
                        photos={photos}
                        onPhotosChange={() => void reloadPhotos()}
                      />
                    )}

                    {stepId === "events" && <EventsStep />}

                    {stepId === "gallery" && (
                      <GalleryStep
                        photos={galleryPhotos}
                        photoUrls={galleryPhotoUrls}
                        coverPhoto={coverPhoto}
                        coverUrl={coverPhoto ? publicPhotoUrl(coverPhoto.storage_path) : undefined}
                        loading={photosLoading}
                        busy={photoBusy}
                        onAdd={(files) => void handleAddPhotos(files)}
                        onRemove={(photo) => void handleRemovePhoto(photo)}
                        onMakeCover={(photo) =>
                          void runPhotoAction(() => setPhotoRole(invitation.id, photo.id, "cover"))
                        }
                        onClearCover={handleClearCover}
                        onCaption={(photo, caption) =>
                          void runPhotoAction(async () => {
                            await updatePhotoCaption(photo.id, caption);
                          })
                        }
                      />
                    )}

                    {stepId === "gifts" && <GiftsStep />}

                    {stepId === "texts" && (
                      <TextsStep invitationId={invitation.id} onMusicReplaced={onMusicReplaced} />
                    )}

                    {stepId === "review" && (
                      <ReviewStep
                        issues={publishIssues}
                        onGoToStep={(id) => setOpenStep(id)}
                        onPublish={() => void handlePublish()}
                        publishing={publishing}
                        canPublish={canPublish}
                        slugError={slugError}
                        slugLocked={slugLocked}
                      />
                    )}
                  </>
                )}
              />

              {error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-xl bg-secondary px-4 py-3 text-sm font-medium">{success}</p>
              )}
            </div>

            <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-border/40 bg-background/95 px-6 py-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={dangerBusy}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the invitation and its photos. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => void handleDelete()}
                      >
                        Delete forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  type="button"
                  className="h-10 rounded-xl bg-accent font-bold text-accent-foreground hover:bg-accent/90"
                  disabled={saving}
                  onClick={() => void handleSave()}
                >
                  {saving ? t(locale, "saving") : t(locale, "saveAndFinish")}
                </Button>
              </div>
            </div>
          </section>

          <EditorPreviewPane
            template={template}
            viewModel={viewModel}
            device={device}
            onDeviceChange={setDevice}
            {...(template ? { demoUrl: `/demo/${template.id}` } : {})}
          />
        </div>
      </EditorShell>
    </FormProvider>
  );
}
