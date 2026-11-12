import { describe, expect, it, vi } from "vitest";
import {
  listMusicWith,
  MAX_MUSIC_BYTES,
  musicPathForCleanup,
  uploadMusicWith,
  validateMusicFile,
} from "./invitation-music";

describe("validateMusicFile", () => {
  it("accepts audio/mpeg", () => {
    expect(validateMusicFile({ type: "audio/mpeg", size: 1, name: "a" })).toBeNull();
  });
  it("accepts an .mp3 name with empty type", () => {
    expect(validateMusicFile({ type: "", name: "a.MP3", size: 1 })).toBeNull();
  });
  it("rejects other types", () => {
    expect(validateMusicFile({ type: "audio/wav", name: "a.wav", size: 1 })).toBe("type");
  });
  it("rejects oversize files", () => {
    expect(MAX_MUSIC_BYTES).toBe(10 * 1024 * 1024);
    expect(
      validateMusicFile({ type: "audio/mpeg", name: "a.mp3", size: MAX_MUSIC_BYTES + 1 }),
    ).toBe("size");
  });
});

function stubUpload(uploadError: string | null = null) {
  const calls: string[] = [];
  const upload = vi.fn(async (path: string) => {
    calls.push(`upload:${path}`);
    if (uploadError) throw new Error(uploadError);
  });
  return { upload, calls };
}

const file = new File(["x"], "My Song.mp3", { type: "audio/mpeg" });

describe("uploadMusicWith", () => {
  it("uploads to a timestamped path and never removes anything", async () => {
    const s = stubUpload();
    const r = await uploadMusicWith(s.upload, "inv", "own", file, 123);
    expect(r).toEqual({ path: "own/inv/music-123.mp3", fileName: "My Song.mp3" });
    expect(s.calls).toEqual(["upload:own/inv/music-123.mp3"]);
  });
  it("throws when upload fails", async () => {
    const s = stubUpload("boom");
    await expect(uploadMusicWith(s.upload, "inv", "own", file, 1)).rejects.toThrow("boom");
  });
});

describe("musicPathForCleanup", () => {
  it("returns the stored music path", () => {
    expect(
      musicPathForCleanup({
        music: { path: "u/i/music-1.mp3", startSeconds: 0, fileName: "a.mp3" },
      }),
    ).toBe("u/i/music-1.mp3");
  });

  it("returns null when there is no music or the content is invalid", () => {
    expect(musicPathForCleanup({})).toBeNull();
    expect(musicPathForCleanup(null)).toBeNull();
    expect(musicPathForCleanup({ music: { path: "../x" } })).toBeNull();
  });
});

describe("listMusicWith", () => {
  it("returns full paths of the files in the invitation's music folder", async () => {
    const list = vi.fn().mockResolvedValue(["own/inv/music-1.mp3", "own/inv/music-2.mp3"]);
    expect(await listMusicWith(list, "own", "inv")).toEqual([
      "own/inv/music-1.mp3",
      "own/inv/music-2.mp3",
    ]);
    expect(list).toHaveBeenCalledWith("own/inv");
  });

  it("returns [] when listing fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const list = vi.fn().mockRejectedValue(new Error("nope"));
    expect(await listMusicWith(list, "own", "inv")).toEqual([]);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
