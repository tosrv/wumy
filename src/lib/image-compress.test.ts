import { describe, expect, it } from "vitest";
import { compressPhoto, fitWithin, renameExtension, shouldCompress } from "./image-compress";

describe("fitWithin", () => {
  it("scales the longest side down to the limit", () => {
    expect(fitWithin(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
    expect(fitWithin(3000, 4000, 2000)).toEqual({ width: 1500, height: 2000 });
  });

  it("never upscales", () => {
    expect(fitWithin(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
});

describe("shouldCompress", () => {
  it("compresses still images and leaves GIFs alone", () => {
    expect(shouldCompress("image/jpeg")).toBe(true);
    expect(shouldCompress("image/png")).toBe(true);
    expect(shouldCompress("image/webp")).toBe(true);
    expect(shouldCompress("image/gif")).toBe(false);
  });
});

describe("renameExtension", () => {
  it("swaps the extension for the output type", () => {
    expect(renameExtension("IMG_0001.JPG", "image/webp")).toBe("IMG_0001.webp");
    expect(renameExtension("photo.png", "image/jpeg")).toBe("photo.jpg");
    expect(renameExtension("noext", "image/webp")).toBe("noext.webp");
  });
});

describe("compressPhoto", () => {
  it("returns the original when it can't process the file", async () => {
    const gif = new File(["x"], "a.gif", { type: "image/gif" });
    expect(await compressPhoto(gif)).toBe(gif);
    // The test runner has no createImageBitmap, so still images pass through too.
    const jpg = new File(["x"], "a.jpg", { type: "image/jpeg" });
    expect(await compressPhoto(jpg)).toBe(jpg);
  });
});
