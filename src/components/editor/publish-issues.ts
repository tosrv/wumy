import { contentPublishSchema } from "@/lib/invitation-content";
import { isValidSlug } from "@/lib/invitations";
import type { EditorStringKey } from "@/lib/editor-i18n";
import { contentFromValues, type EditorFormValues } from "@/components/editor/editor-form";
import type { EditorStepId } from "@/components/editor/sections/EditorStepHeader";

export type PublishIssue = {
  step: EditorStepId;
  key: EditorStringKey;
  /** 1-based item number for events/gifts. */
  index?: number;
};

const EVENT_FIELD_KEYS: Partial<Record<string, EditorStringKey>> = {
  date: "issueEventDate",
  startTime: "issueEventTime",
  venueName: "issueEventVenue",
  mapsUrl: "issueEventMaps",
};

function issueForPath(path: readonly PropertyKey[]): PublishIssue {
  const [root, second, third] = path;
  if (root === "partners") {
    return { step: "partners", key: second === "b" ? "issuePartnerB" : "issuePartnerA" };
  }
  if (root === "events") {
    if (typeof second !== "number") return { step: "events", key: "issueNoEvents" };
    const key = EVENT_FIELD_KEYS[String(third)] ?? "issueEventInvalid";
    return { step: "events", key, index: second + 1 };
  }
  if (root === "gifts") {
    return typeof second === "number"
      ? { step: "gifts", key: "issueGiftIncomplete", index: second + 1 }
      : { step: "gifts", key: "issueGiftIncomplete" };
  }
  return { step: "review", key: "issueOther" };
}

/** Publish blockers in step order of discovery, de-duplicated per step/message/item. */
export function collectPublishIssues(values: EditorFormValues): PublishIssue[] {
  const issues: PublishIssue[] = [];
  const seen = new Set<string>();
  const push = (issue: PublishIssue) => {
    const id = `${issue.step}:${issue.key}:${issue.index ?? ""}`;
    if (seen.has(id)) return;
    seen.add(id);
    issues.push(issue);
  };

  const result = contentPublishSchema.safeParse(contentFromValues(values));
  if (!result.success) {
    for (const issue of result.error.issues) push(issueForPath(issue.path));
  }
  if (!isValidSlug(values.slug)) push({ step: "review", key: "issueSlug" });
  return issues;
}

/**
 * True when a save must be held: the invitation is live and the content no
 * longer passes the publish check, so writing it would break the public page.
 */
export function isLiveSaveBlocked(status: string, values: EditorFormValues): boolean {
  return (
    status === "published" && !contentPublishSchema.safeParse(contentFromValues(values)).success
  );
}
