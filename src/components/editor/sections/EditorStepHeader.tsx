import type { ReactNode } from "react";
import type { EditorStringKey } from "@/lib/editor-i18n";

export const EDITOR_STEPS = [
  {
    id: "template",
    labelKey: "stepTemplate",
    description: "Select a visual direction for your digital invitation.",
  },
  {
    id: "partners",
    labelKey: "stepPartners",
    description: "Couple names and your public invitation URL.",
  },
  { id: "events", labelKey: "stepEvents", description: "Wedding date and venue information." },
  { id: "gallery", labelKey: "stepGallery", description: "Upload moments that tell your story." },
  {
    id: "gifts",
    labelKey: "stepGifts",
    description: "Bank accounts, e-wallets and gift addresses.",
  },
  { id: "texts", labelKey: "stepTexts", description: "Quote, greeting and closing words." },
  {
    id: "review",
    labelKey: "stepReview",
    description: "Review your invitation, then save or publish.",
  },
] as const satisfies readonly { id: string; labelKey: EditorStringKey; description: string }[];

export type EditorStepId = (typeof EDITOR_STEPS)[number]["id"];

interface EditorStatusBarProps {
  /** Autosave status, e.g. "Saving…" / "Saved". */
  saveStatus?: ReactNode;
  /** Shown when edits to a live invitation are held back, e.g. required fields are missing. */
  warning?: ReactNode;
}

/** Autosave status and the "changes not live" warning, above the editor sections. */
export function EditorStatusBar({ saveStatus, warning }: EditorStatusBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="min-h-4 text-right text-[11px] font-bold text-muted-foreground"
        aria-live="polite"
      >
        {saveStatus}
      </p>
      {warning && (
        <div className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive">
          {warning}
        </div>
      )}
    </div>
  );
}
