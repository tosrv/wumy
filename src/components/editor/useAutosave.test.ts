import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAutosaver } from "@/components/editor/useAutosave";

function deferred() {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("createAutosaver", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounces 1500ms", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const saver = createAutosaver<number>(save, 1500);
    saver.schedule(1);
    saver.schedule(2);
    await vi.advanceTimersByTimeAsync(1499);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(2);
    expect(saver.getState()).toBe("saved");
  });

  it("queues latest change", async () => {
    const first = deferred();
    const save = vi
      .fn<(v: number) => Promise<void>>()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue(undefined);
    const saver = createAutosaver<number>(save, 1500);
    saver.schedule(1);
    await vi.advanceTimersByTimeAsync(1500);
    expect(saver.getState()).toBe("saving");
    saver.schedule(2);
    saver.schedule(3);
    await vi.advanceTimersByTimeAsync(5000);
    expect(save).toHaveBeenCalledTimes(1);
    first.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(3);
    await vi.advanceTimersByTimeAsync(5000);
    expect(save).toHaveBeenCalledTimes(2);
    expect(saver.getState()).toBe("saved");
  });

  it("error state then retries on next change", async () => {
    const save = vi
      .fn<(v: number) => Promise<void>>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(undefined);
    const saver = createAutosaver<number>(save, 1500);
    saver.schedule(1);
    await vi.advanceTimersByTimeAsync(1500);
    expect(saver.getState()).toBe("error");
    await vi.advanceTimersByTimeAsync(5000);
    expect(save).toHaveBeenCalledTimes(1);
    saver.schedule(2);
    await vi.advanceTimersByTimeAsync(1500);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(2);
    expect(saver.getState()).toBe("saved");
  });

  it("flush saves pending value immediately", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const saver = createAutosaver<number>(save, 1500);
    saver.schedule(7);
    await saver.flush();
    expect(save).toHaveBeenCalledWith(7);
    await vi.advanceTimersByTimeAsync(5000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("saveNow while an autosave is in flight never overlaps and writes the latest value last", async () => {
    const first = deferred();
    let active = 0;
    let maxActive = 0;
    const written: number[] = [];
    const save = vi.fn(async (v: number) => {
      active++;
      maxActive = Math.max(maxActive, active);
      if (written.length === 0) await first.promise;
      written.push(v);
      active--;
    });
    const saver = createAutosaver<number>(save, 1500);
    saver.schedule(1);
    await vi.advanceTimersByTimeAsync(1500);
    const manual = saver.saveNow(2);
    saver.schedule(3);
    first.resolve();
    await expect(manual).resolves.toBe(true);
    await vi.advanceTimersByTimeAsync(5000);
    expect(maxActive).toBe(1);
    expect(written.at(-1)).toBe(3);
  });

  it("saves a change reverted to the original value after an intermediate save", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const saver = createAutosaver<string>(save, 1500, undefined, "A");
    saver.schedule("A"); // initial load: equals baseline
    await vi.advanceTimersByTimeAsync(5000);
    expect(save).not.toHaveBeenCalled();
    saver.schedule("AB");
    await vi.advanceTimersByTimeAsync(1500);
    saver.schedule("A");
    await vi.advanceTimersByTimeAsync(1500);
    expect(save.mock.calls.map((c) => c[0])).toEqual(["AB", "A"]);
  });

  it("dispose saves a pending value instead of dropping it", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const saver = createAutosaver<number>(save, 1500);
    saver.schedule(7);
    expect(saver.hasUnsaved()).toBe(true);
    saver.dispose();
    await vi.advanceTimersByTimeAsync(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(7);
    expect(saver.hasUnsaved()).toBe(false);
  });

  it("dispose with nothing pending does not save", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const saver = createAutosaver<number>(save, 1500);
    saver.dispose();
    await vi.advanceTimersByTimeAsync(2000);
    expect(save).not.toHaveBeenCalled();
  });
});
