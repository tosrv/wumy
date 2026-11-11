import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/invitation-content";
import { cn } from "@/lib/utils";
import { photoLabel, templateLabel } from "../labels";
import { nextFocusIndex, nextIndex, swipeDirection } from "./lightbox-index";

/** Full-screen photo viewer, portaled to body while `index !== null`. Styling via class props. */
export function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
  locale,
  className,
  imageClassName,
  buttonClassName,
  closeButtonClassName,
  prevButtonClassName,
  nextButtonClassName,
}: {
  photos: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  locale: Locale;
  className?: string;
  imageClassName?: string;
  /** Shared base for all three buttons. */
  buttonClassName?: string;
  closeButtonClassName?: string;
  prevButtonClassName?: string;
  nextButtonClassName?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const isOpen = index !== null;
  const len = photos.length;

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const buttons = Array.from(dialogRef.current?.querySelectorAll("button") ?? []);
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const target = buttons[nextFocusIndex(current, buttons.length, e.shiftKey)];
        e.preventDefault();
        target?.focus();
      } else if (e.key === "Escape") onClose();
      else if (len > 1 && e.key === "ArrowRight") onIndex(nextIndex(index, len, 1));
      else if (len > 1 && e.key === "ArrowLeft") onIndex(nextIndex(index, len, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, len, onClose, onIndex]);

  if (index === null || typeof document === "undefined") return null;
  const step = (dir: 1 | -1) => onIndex(nextIndex(index, len, dir));

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={photoLabel(locale, index, len)}
      className={className}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        const end = e.changedTouches[0]?.clientX;
        if (start === null || end === undefined || len < 2) return;
        const dir = swipeDirection(end - start);
        if (dir !== 0) step(dir);
      }}
    >
      <img src={photos[index]} alt={photoLabel(locale, index, len)} className={imageClassName} />
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={templateLabel(locale, "close")}
        className={cn(buttonClassName, closeButtonClassName)}
      >
        ×
      </button>
      {len > 1 && (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={templateLabel(locale, "previous")}
            className={cn(buttonClassName, prevButtonClassName)}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={templateLabel(locale, "next")}
            className={cn(buttonClassName, nextButtonClassName)}
          >
            ›
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
