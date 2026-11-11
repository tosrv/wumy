import { describe, expect, it } from "vitest";
import { orphanedMusicPaths, pathsSafeToDelete } from "./music-cleanup";

describe("pathsSafeToDelete", () => {
  it("returns all pending paths when nothing is saved", () => {
    expect(pathsSafeToDelete(["a", "b"], undefined)).toEqual(["a", "b"]);
  });
  it("keeps the path the saved content still references", () => {
    expect(pathsSafeToDelete(["a", "b"], "b")).toEqual(["a"]);
  });
  it("returns nothing for an empty list", () => {
    expect(pathsSafeToDelete([], "a")).toEqual([]);
  });
});

describe("orphanedMusicPaths", () => {
  const folder = "u/i";
  it("returns music files in the folder that nothing still references", () => {
    expect(
      orphanedMusicPaths(
        [`${folder}/music-1.mp3`, `${folder}/music-2.mp3`, `${folder}/music-3.mp3`],
        [`${folder}/music-2.mp3`, undefined],
      ),
    ).toEqual([`${folder}/music-1.mp3`, `${folder}/music-3.mp3`]);
  });

  it("keeps every referenced path (saved, last written, current form)", () => {
    expect(
      orphanedMusicPaths(
        [`${folder}/music-1.mp3`, `${folder}/music-2.mp3`],
        [`${folder}/music-1.mp3`, `${folder}/music-2.mp3`],
      ),
    ).toEqual([]);
  });

  it("ignores files that are not uploaded music tracks", () => {
    expect(
      orphanedMusicPaths([`${folder}/.emptyFolderPlaceholder`, `${folder}/notes.txt`], []),
    ).toEqual([]);
  });
});
