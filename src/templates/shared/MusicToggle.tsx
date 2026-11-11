import type { Locale } from "@/lib/invitation-content";
import { cn } from "@/lib/utils";
import { templateLabel } from "../labels";

/** Fixed 44×44 play/pause button for background music. */
export function MusicToggle({
  playing,
  onToggle,
  locale,
  className,
  iconClassName,
}: {
  playing: boolean;
  onToggle: () => void;
  locale: Locale;
  className?: string;
  iconClassName?: string;
}) {
  const label = templateLabel(locale, playing ? "pauseMusic" : "playMusic");
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={label}
      title={label}
      className={cn(
        "fixed right-4 bottom-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full shadow-md",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn(
          playing && "animate-spin [animation-duration:4s] motion-reduce:animate-none",
          iconClassName,
        )}
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    </button>
  );
}
