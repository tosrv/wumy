import { toast } from "sonner";
import type { Locale } from "@/lib/invitation-content";
import { templateLabel } from "../labels";

/** Copies `value` to the clipboard and reports the result with a toast. */
export function CopyButton({
  value,
  locale,
  kind = "number",
  className,
}: {
  value: string;
  locale: Locale;
  kind?: "number" | "address";
  className?: string;
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast(templateLabel(locale, kind === "number" ? "copiedNumber" : "copiedAddress"));
    } catch {
      toast.error(templateLabel(locale, "copyFailed"));
    }
  };

  return (
    <button type="button" className={className} onClick={() => void copy()}>
      {templateLabel(locale, kind === "number" ? "copyNumber" : "copyAddress")}
    </button>
  );
}
