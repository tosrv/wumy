export type MusicState = {
  playing: boolean;
  manuallyPaused: boolean;
  wasPlayingBeforeHidden: boolean;
};

export type MusicEvent =
  | { type: "userOpened" }
  | { type: "toggle" }
  | { type: "hidden" }
  | { type: "visible" }
  | { type: "playRejected" };

export const INITIAL_MUSIC_STATE: MusicState = {
  playing: false,
  manuallyPaused: false,
  wasPlayingBeforeHidden: false,
};

/** Pure playback transitions for background music. */
export function musicNextState(s: MusicState, e: MusicEvent): MusicState {
  switch (e.type) {
    case "userOpened":
      return s.manuallyPaused ? s : { ...s, playing: true };
    case "toggle":
      return s.playing
        ? { ...s, playing: false, manuallyPaused: true, wasPlayingBeforeHidden: false }
        : { ...s, playing: true, manuallyPaused: false };
    case "hidden":
      return s.playing
        ? { ...s, playing: false, wasPlayingBeforeHidden: true }
        : { ...s, wasPlayingBeforeHidden: false };
    case "visible":
      return s.wasPlayingBeforeHidden && !s.manuallyPaused
        ? { ...s, playing: true, wasPlayingBeforeHidden: false }
        : { ...s, wasPlayingBeforeHidden: false };
    case "playRejected":
      return { ...s, playing: false, wasPlayingBeforeHidden: false };
  }
}

/** Seek target in seconds: 0 when duration is unknown or the start lies beyond it. */
export function startOffset(startSeconds: number, duration: number): number {
  if (!Number.isFinite(duration) || startSeconds >= duration) return 0;
  return Math.max(0, startSeconds);
}
