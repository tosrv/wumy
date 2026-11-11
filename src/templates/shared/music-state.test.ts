import { describe, expect, it } from "vitest";
import { INITIAL_MUSIC_STATE, musicNextState, startOffset, type MusicEvent } from "./music-state";

const run = (...events: MusicEvent["type"][]) =>
  events.reduce((s, type) => musicNextState(s, { type } as MusicEvent), INITIAL_MUSIC_STATE);

describe("musicNextState", () => {
  it("starts paused", () => {
    expect(INITIAL_MUSIC_STATE).toEqual({
      playing: false,
      manuallyPaused: false,
      wasPlayingBeforeHidden: false,
    });
  });
  it("plays on userOpened", () => {
    expect(run("userOpened").playing).toBe(true);
  });
  it("toggle while playing pauses manually", () => {
    const s = run("userOpened", "toggle");
    expect(s.playing).toBe(false);
    expect(s.manuallyPaused).toBe(true);
  });
  it("hidden while playing pauses and remembers", () => {
    const s = run("userOpened", "hidden");
    expect(s.playing).toBe(false);
    expect(s.wasPlayingBeforeHidden).toBe(true);
    expect(musicNextState(s, { type: "visible" }).playing).toBe(true);
  });
  it("manual pause survives visibility", () => {
    expect(run("userOpened", "toggle", "hidden", "visible").playing).toBe(false);
  });
  it("play rejected pauses without manual flag", () => {
    const s = run("userOpened", "playRejected");
    expect(s.playing).toBe(false);
    expect(s.manuallyPaused).toBe(false);
  });
});

describe("startOffset", () => {
  it("start beyond duration", () => {
    expect(startOffset(90, 60)).toBe(0);
    expect(startOffset(30, 60)).toBe(30);
    expect(startOffset(10, NaN)).toBe(0);
  });
});
