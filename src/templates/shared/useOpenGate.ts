import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { prefersReducedMotion, shouldLockScroll } from "./motion";

export const OPEN_ANIMATION_MS = 900;

/** Cover gate: locks page scroll until opened; `opening` is true during the open animation. */
export function useOpenGate(opts: { startOpened?: boolean }): {
  open: boolean;
  opening: boolean;
  openGate: () => void;
  /** Attach to `<main>`; receives focus once the user opens the gate. */
  mainRef: RefObject<HTMLElement | null>;
  /** True only after the guest opened the gate themselves (never via `startOpened`). */
  userOpened: boolean;
} {
  const [open, setOpen] = useState(Boolean(opts.startOpened));
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!shouldLockScroll(open)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const mainRef = useRef<HTMLElement | null>(null);
  const [userOpened, setUserOpened] = useState(false);
  useEffect(() => {
    if (open && userOpened) mainRef.current?.focus({ preventScroll: true });
  }, [open, userOpened]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const openGate = useCallback(() => {
    if (open || opening) return;
    setUserOpened(true);
    if (prefersReducedMotion()) {
      setOpen(true);
      return;
    }
    setOpening(true);
    timer.current = setTimeout(() => {
      setOpening(false);
      setOpen(true);
    }, OPEN_ANIMATION_MS);
  }, [open, opening]);

  return { open, opening, openGate, mainRef, userOpened };
}
