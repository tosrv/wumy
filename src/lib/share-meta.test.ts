import { describe, expect, it } from "vitest";
import { buildShareMeta, formatShareDate, pickShareImage } from "./share-meta";

const base = {
  partnerA: { nickname: "Ayu", fullName: "Ayu Lestari" },
  partnerB: { nickname: "Budi", fullName: "Budi Santoso" },
  eventDates: ["2027-08-24"],
};

describe("formatShareDate", () => {
  it("formats an ISO date in Indonesian with the weekday", () => {
    expect(formatShareDate("2027-08-24")).toBe("Selasa, 24 Agustus 2027");
  });

  it("returns empty for blank or invalid dates", () => {
    expect(formatShareDate("")).toBe("");
    expect(formatShareDate("2027-13-40")).toBe("");
  });
});

describe("buildShareMeta", () => {
  it("uses nicknames, the first dated event and the image", () => {
    expect(buildShareMeta({ ...base, image: "https://x/cover.jpg" })).toEqual({
      title: "Ayu & Budi — Undangan Pernikahan",
      description: "Selasa, 24 Agustus 2027 · Buka undangan kami",
      image: "https://x/cover.jpg",
    });
  });

  it("falls back to full names when a nickname is empty", () => {
    const m = buildShareMeta({ ...base, partnerA: { nickname: " ", fullName: "Ayu Lestari" } });
    expect(m.title).toBe("Ayu Lestari & Budi — Undangan Pernikahan");
  });

  it("skips events without a date and copes with none", () => {
    expect(buildShareMeta({ ...base, eventDates: ["", "2027-09-01"] }).description).toBe(
      "Rabu, 1 September 2027 · Buka undangan kami",
    );
    expect(buildShareMeta({ ...base, eventDates: [] }).description).toBe(
      "Kami mengundang Anda. Buka undangan kami.",
    );
  });

  it("addresses the guest from ?to=", () => {
    expect(buildShareMeta({ ...base, guestName: "Pak Joko" }).title).toBe(
      "Kepada Pak Joko: Ayu & Budi — Undangan Pernikahan",
    );
  });

  it("omits the image when there is none", () => {
    expect(buildShareMeta(base).image).toBeUndefined();
  });
});

describe("pickShareImage", () => {
  it("prefers the cover, then the first gallery photo", () => {
    expect(
      pickShareImage([
        { storage_path: "g1", role: "gallery" },
        { storage_path: "c", role: "cover" },
      ]),
    ).toBe("c");
    expect(
      pickShareImage([
        { storage_path: "pa", role: "partner_a" },
        { storage_path: "g1", role: "gallery" },
      ]),
    ).toBe("g1");
    expect(pickShareImage([{ storage_path: "pa", role: "partner_a" }])).toBeUndefined();
  });
});
