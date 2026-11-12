import type { EditorFormValues } from "@/components/editor/editor-form";
import type { PublishIssue } from "@/components/editor/publish-issues";
import { EDITOR_STEPS, type EditorStepId } from "@/components/editor/sections/EditorStepHeader";
import type { Locale } from "@/lib/invitation-content";

/** Badge shown on a collapsed editor section. */
export type StepState = "complete" | "warning" | "empty";

const hasText = (s: string) => s.trim() !== "";
const partnerName = (p: { nickname: string; fullName: string }) =>
  p.nickname.trim() || p.fullName.trim();

/**
 * Per-section badge: `warning` when the section has publish blockers, `complete`
 * when it is filled and has none, `empty` otherwise. Review is never `complete`.
 */
export function stepStates(
  v: EditorFormValues,
  ctx: { issues: readonly PublishIssue[]; galleryCount: number },
): Record<EditorStepId, StepState> {
  const blocked = new Set(ctx.issues.map((i) => i.step));
  const filled: Record<EditorStepId, boolean> = {
    partners: Boolean(partnerName(v.partners.a) && partnerName(v.partners.b)),
    events: v.events.length > 0,
    gallery: ctx.galleryCount > 0 || hasText(v.story),
    gifts: v.gifts.length > 0,
    texts: hasText(v.quote) || hasText(v.greeting) || hasText(v.closing),
    review: false,
  };
  const out = {} as Record<EditorStepId, StepState>;
  for (const { id } of EDITOR_STEPS) {
    out[id] = blocked.has(id) ? "warning" : filled[id] ? "complete" : "empty";
  }
  return out;
}

const COPY = {
  id: {
    empty: "Belum diisi",
    events: (n: number) => `${n} acara`,
    photos: (n: number) => `${n} foto`,
    story: "cerita",
    language: { id: "Bahasa Indonesia", en: "English" },
    music: "musik",
  },
  en: {
    empty: "Not filled",
    events: (n: number) => `${n} ${n === 1 ? "event" : "events"}`,
    photos: (n: number) => `${n} ${n === 1 ? "photo" : "photos"}`,
    story: "story",
    language: { id: "Indonesian", en: "English" },
    music: "music",
  },
} as const;

/** One-line summary shown in a collapsed section header. */
export function stepSummary(
  id: EditorStepId,
  v: EditorFormValues,
  ctx: { galleryCount: number; templateName?: string | undefined; locale: Locale },
): string {
  const c = COPY[ctx.locale];
  switch (id) {
    case "partners": {
      const a = partnerName(v.partners.a);
      const b = partnerName(v.partners.b);
      return a || b ? [a, b].filter(Boolean).join(" & ") : c.empty;
    }
    case "events":
      return v.events.length > 0 ? c.events(v.events.length) : c.empty;
    case "gallery": {
      const parts = [
        ctx.galleryCount > 0 ? c.photos(ctx.galleryCount) : "",
        hasText(v.story) ? c.story : "",
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : c.empty;
    }
    case "gifts": {
      const names = v.gifts
        .map((g) =>
          g.kind === "bank"
            ? g.bankName
            : g.kind === "ewallet"
              ? g.provider.toUpperCase()
              : g.recipient,
        )
        .map((s) => s.trim())
        .filter(Boolean);
      return names.length > 0 ? names.slice(0, 3).join(", ") : c.empty;
    }
    case "texts":
      return [c.language[v.locale], v.music ? c.music : ""].filter(Boolean).join(" · ");
    case "review":
      return hasText(v.slug) ? `/${v.slug.trim()}` : c.empty;
  }
}

/** `?step=` search param → a known section id, or undefined. */
export function parseStepParam(raw: unknown): EditorStepId | undefined {
  return EDITOR_STEPS.find((s) => s.id === raw)?.id;
}

/** DOM id of an editor accordion section (used to scroll it into view). */
export function editorSectionDomId(id: EditorStepId): string {
  return `editor-section-${id}`;
}
