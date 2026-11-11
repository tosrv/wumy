import { useEffect, useMemo, useRef, useState } from "react";

export type AutosaveState = "idle" | "saving" | "saved" | "error";

export const AUTOSAVE_DELAY_MS = 1500;

export interface Autosaver<T> {
  /** Record a new value; it is saved after `delayMs` of quiet. */
  schedule: (value: T) => void;
  /** Queue `value` and save it now, after any in-flight save. Resolves true if it was saved. */
  saveNow: (value: T) => Promise<boolean>;
  /** Save any pending value now and wait for in-flight saves to finish. */
  flush: () => Promise<void>;
  getState: () => AutosaveState;
  /** True while a value is waiting to be saved or a save is in flight. */
  hasUnsaved: () => boolean;
  /** Stop timers and save any pending value right away (it is not dropped). */
  dispose: () => void;
}

/**
 * Framework-free debounced saver. One save runs at a time; a change made
 * while a save is in flight is saved once, with the latest value, after it ends.
 * A failed save sets "error" and is retried only when the next change arrives.
 * A value equal (by JSON) to the last saved one, or to `baseline`, is not saved.
 */
export function createAutosaver<T>(
  save: (value: T) => Promise<void>,
  delayMs: number = AUTOSAVE_DELAY_MS,
  onState?: (state: AutosaveState) => void,
  baseline?: T,
): Autosaver<T> {
  const key = (v: T) => JSON.stringify(v);
  let lastSavedKey: string | null = baseline === undefined ? null : key(baseline);
  let state: AutosaveState = "idle";
  let pending: { value: T } | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight: Promise<void> | null = null;

  const setState = (next: AutosaveState) => {
    state = next;
    onState?.(next);
  };

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const run = (): Promise<void> => {
    clearTimer();
    if (inFlight) return inFlight;
    if (!pending) return Promise.resolve();
    const { value } = pending;
    pending = null;
    setState("saving");
    inFlight = save(value).then(
      () => {
        inFlight = null;
        lastSavedKey = key(value);
        if (pending) return run();
        setState("saved");
        return undefined;
      },
      () => {
        inFlight = null;
        if (pending) return run();
        setState("error");
        return undefined;
      },
    );
    return inFlight;
  };

  return {
    schedule(value) {
      if (!inFlight && key(value) === lastSavedKey) {
        // Reverted to what is already saved: nothing to do.
        clearTimer();
        pending = null;
        return;
      }
      pending = { value };
      if (inFlight) return; // picked up when the current save settles
      clearTimer();
      timer = setTimeout(() => void run(), delayMs);
    },
    async flush() {
      while (pending || inFlight) await run();
    },
    async saveNow(value) {
      pending = { value };
      while (pending || inFlight) await run();
      return state === "saved";
    },
    getState: () => state,
    hasUnsaved: () => pending !== null || inFlight !== null,
    dispose() {
      clearTimer();
      if (pending) void run();
    },
  };
}

export function useAutosave<T>(opts: {
  value: T;
  /** Optional extra gate; changes are otherwise detected against the last saved value. */
  dirty?: boolean;
  save: (v: T) => Promise<void>;
  delayMs?: number;
}): {
  state: AutosaveState;
  flush: () => Promise<void>;
  saveNow: (v: T) => Promise<boolean>;
} {
  const { value, dirty = true, save, delayMs = AUTOSAVE_DELAY_MS } = opts;
  const [state, setState] = useState<AutosaveState>("idle");
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  // The first value is the baseline, so nothing is saved on initial load.
  const [baseline] = useState(value);
  const saver = useMemo(
    () => createAutosaver<T>((v) => saveRef.current(v), delayMs, setState, baseline),
    [delayMs, baseline],
  );
  useEffect(() => () => saver.dispose(), [saver]);

  // Warn before leaving the page while an edit is not yet saved.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!saver.hasUnsaved()) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saver]);

  useEffect(() => {
    if (dirty) saver.schedule(value);
  }, [saver, value, dirty]);

  return { state, flush: saver.flush, saveNow: saver.saveNow };
}
