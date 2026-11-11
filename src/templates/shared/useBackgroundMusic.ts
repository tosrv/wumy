import { useCallback, useEffect, useReducer, useRef } from "react";
import { INITIAL_MUSIC_STATE, musicNextState, startOffset } from "./music-state";

/** Background music: starts only after the guest opens the gate; SSR-safe (Audio created in effects). */
export function useBackgroundMusic(
  music: { url: string; startSeconds: number } | undefined,
  opts: { userOpened: boolean },
): { playing: boolean; toggle: () => void; available: boolean } {
  const [state, dispatch] = useReducer(musicNextState, INITIAL_MUSIC_STATE);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const url = music?.url;
  const startSeconds = music?.startSeconds ?? 0;
  const available = Boolean(url);
  const startSecondsRef = useRef(startSeconds);
  useEffect(() => {
    startSecondsRef.current = startSeconds;
  });

  useEffect(() => {
    if (!url) return;
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    let seeked = false;
    const onMeta = () => {
      if (seeked) return;
      seeked = true;
      audio.currentTime = startOffset(startSecondsRef.current, audio.duration);
    };
    audio.addEventListener("loadedmetadata", onMeta);
    audio.src = url;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.src = "";
      if (audioRef.current === audio) audioRef.current = null;
    };
    // Only a URL change recreates the Audio; startSeconds is read from a ref.
  }, [url]);

  const dispatchedOpen = useRef(false);
  useEffect(() => {
    if (!opts.userOpened || dispatchedOpen.current) return;
    dispatchedOpen.current = true;
    dispatch({ type: "userOpened" });
  }, [opts.userOpened]);

  useEffect(() => {
    const onVisibility = () =>
      dispatch({ type: document.visibilityState === "hidden" ? "hidden" : "visible" });
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.playing) {
      audio.play().catch((err: unknown) => {
        // Ignore a stale rejection from a replaced Audio, or a play() aborted by pause().
        if (audioRef.current !== audio) return;
        if (err instanceof Error && err.name === "AbortError") return;
        dispatch({ type: "playRejected" });
      });
    } else {
      audio.pause();
    }
  }, [state.playing, url]);

  const toggle = useCallback(() => {
    if (!available) return;
    dispatch({ type: "toggle" });
  }, [available]);

  return { playing: state.playing, toggle, available };
}
