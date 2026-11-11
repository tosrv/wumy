import { describe, expect, it, vi } from "vitest";
import {
  replacePhotoFileWith,
  isSlugLocked,
  slugSaveError,
  type InvitationPhotoRow,
  type ReplacePhotoDeps,
} from "./invitations";

describe("slugSaveError", () => {
  it("rejects reserved app paths before checking availability", async () => {
    const available = vi.fn(async () => true);
    expect(await slugSaveError("dashboard", available)).toBe("reserved");
    expect(await slugSaveError("payment", available)).toBe("reserved");
    expect(available).not.toHaveBeenCalled();
  });

  it("reports an invalid slug without checking availability", async () => {
    const available = vi.fn().mockResolvedValue(true);
    expect(await slugSaveError("A!", available)).toBe("invalid");
    expect(available).not.toHaveBeenCalled();
  });

  it("reports a taken slug", async () => {
    expect(await slugSaveError("ayu-budi", async () => false)).toBe("taken");
  });

  it("accepts a valid, available slug", async () => {
    expect(await slugSaveError("ayu-budi", async () => true)).toBeNull();
  });
});

describe("replacePhotoFileWith", () => {
  const photo = { id: "p1", storage_path: "u/i/old.jpg" } as InvitationPhotoRow;
  const deps = (over: Partial<ReplacePhotoDeps> = {}) => {
    const calls: string[] = [];
    const d: ReplacePhotoDeps = {
      upload: vi.fn(async (path) => void calls.push(`upload ${path}`)),
      updatePath: vi.fn(async (id, path) => {
        calls.push(`update ${id} ${path}`);
        return { ...photo, storage_path: path };
      }),
      remove: vi.fn(async (path) => void calls.push(`remove ${path}`)),
      ...over,
    };
    return { d, calls };
  };

  it("uploads, repoints the same row, then removes the old file (no new row)", async () => {
    const { d, calls } = deps();
    const row = await replacePhotoFileWith(d, photo, "u/i/new.jpg");
    expect(calls).toEqual(["upload u/i/new.jpg", "update p1 u/i/new.jpg", "remove u/i/old.jpg"]);
    expect(row.id).toBe("p1");
    expect(row.storage_path).toBe("u/i/new.jpg");
  });

  it("removes the new file and keeps the old one when the row update fails", async () => {
    const { d, calls } = deps({
      updatePath: vi.fn(async () => {
        throw new Error("denied");
      }),
    });
    await expect(replacePhotoFileWith(d, photo, "u/i/new.jpg")).rejects.toThrow("denied");
    expect(calls).toEqual(["upload u/i/new.jpg", "remove u/i/new.jpg"]);
  });

  it("does not fail when the old file cannot be removed", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { d } = deps({
      remove: vi.fn(async () => {
        throw new Error("gone");
      }),
    });
    await expect(replacePhotoFileWith(d, photo, "u/i/new.jpg")).resolves.toMatchObject({
      storage_path: "u/i/new.jpg",
    });
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("isSlugLocked", () => {
  it("locks the slug once the invitation has been published", () => {
    expect(isSlugLocked({ published_at: "2026-11-11T00:00:00Z" })).toBe(true);
  });

  it("leaves drafts and paid-but-unpublished invitations editable", () => {
    expect(isSlugLocked({ published_at: null })).toBe(false);
  });
});
