import { describe, expect, test } from "vitest";
import {
  contentDraftSchema,
  contentPublishSchema,
  emptyContent,
  newId,
  type InvitationContent,
} from "./invitation-content";

const p = { fullName: "", nickname: "", fatherName: "", motherName: "", childOrder: "" };

const mkEvent = () => ({
  id: newId(),
  kind: "resepsi" as const,
  title: "",
  date: "2027-08-24",
  startTime: "09:00",
  endTime: "",
  venueName: "Gedung",
  venueAddress: "",
  mapsUrl: "",
});

const base = (): InvitationContent => ({
  ...emptyContent(),
  partners: { a: { ...p, nickname: "Sinta" }, b: { ...p, nickname: "Rama" } },
});

const withEvent = (over: Record<string, unknown> = {}) => ({
  ...base(),
  events: [{ ...mkEvent(), ...over }],
});

const withGift = (gift: Record<string, unknown>) => ({ ...withEvent(), gifts: [gift] });

describe("invitation content schema", () => {
  test("draft accepts partial", () => {
    expect(contentDraftSchema.parse({ locale: "en" })).toMatchObject({
      locale: "en",
      religion: "umum",
      events: [],
      gifts: [],
    });
  });

  test("draft of garbage never throws and yields defaults", () => {
    expect(contentDraftSchema.parse(null)).toEqual(emptyContent());
    expect(contentDraftSchema.parse({ locale: "xx", events: "nope" })).toMatchObject({
      locale: "id",
      events: [],
    });
  });

  test("publish rejects missing event", () => {
    expect(contentPublishSchema.safeParse(base()).success).toBe(false);
  });

  test("publish rejects missing partner names", () => {
    expect(
      contentPublishSchema.safeParse({ ...withEvent(), partners: emptyContent().partners }).success,
    ).toBe(false);
  });

  test("publish accepts complete", () => {
    expect(contentPublishSchema.safeParse(withEvent()).success).toBe(true);
  });

  test("publish accepts full name instead of nickname", () => {
    const c = {
      ...withEvent(),
      partners: { a: { ...p, fullName: "Sinta A" }, b: { ...p, fullName: "Rama B" } },
    };
    expect(contentPublishSchema.safeParse(c).success).toBe(true);
  });

  test("publish rejects event without venueName", () => {
    expect(contentPublishSchema.safeParse(withEvent({ venueName: "" })).success).toBe(false);
  });

  test("rejects non-https maps url", () => {
    expect(
      contentPublishSchema.safeParse(withEvent({ mapsUrl: "javascript:alert(1)" })).success,
    ).toBe(false);
    expect(
      contentPublishSchema.safeParse(withEvent({ mapsUrl: "http://maps.app/x" })).success,
    ).toBe(false);
    expect(
      contentPublishSchema.safeParse(withEvent({ mapsUrl: "https://maps.app/x" })).success,
    ).toBe(true);
  });

  test("draft blanks invalid maps url", () => {
    const c = contentDraftSchema.parse(withEvent({ mapsUrl: "javascript:alert(1)" }));
    expect(c.events[0]?.mapsUrl).toBe("");
  });

  test("rejects bad time/date formats", () => {
    expect(contentPublishSchema.safeParse(withEvent({ startTime: "25:00" })).success).toBe(false);
    expect(contentPublishSchema.safeParse(withEvent({ date: "24-08-2027" })).success).toBe(false);
    expect(contentPublishSchema.safeParse(withEvent({ endTime: "10:00" })).success).toBe(true);
  });

  test("publish rejects incomplete bank gift", () => {
    const gift = {
      id: newId(),
      kind: "bank",
      bankName: "BCA",
      accountName: "Sinta",
      accountNumber: "",
    };
    expect(contentPublishSchema.safeParse(withGift(gift)).success).toBe(false);
    expect(
      contentPublishSchema.safeParse(withGift({ ...gift, accountNumber: "123" })).success,
    ).toBe(true);
  });

  test("publish rejects incomplete address gift", () => {
    const gift = { id: newId(), kind: "address", recipient: "Sinta", address: "" };
    expect(contentPublishSchema.safeParse(withGift(gift)).success).toBe(false);
  });

  test("draft truncates events and gifts to 6", () => {
    expect(
      contentDraftSchema.parse({ events: Array.from({ length: 7 }, mkEvent) }).events,
    ).toHaveLength(6);
    const gifts = Array.from({ length: 7 }, () => ({
      id: newId(),
      kind: "address",
      recipient: "a",
      address: "b",
    }));
    expect(contentDraftSchema.parse({ gifts }).gifts).toHaveLength(6);
  });

  test("draft assigns id when missing", () => {
    const { id: _id, ...noId } = mkEvent();
    expect(contentDraftSchema.parse({ events: [noId] }).events[0]?.id).toMatch(/.+/);
  });

  test("emptyContent defaults", () => {
    expect(emptyContent()).toMatchObject({
      version: 1,
      locale: "id",
      religion: "umum",
      events: [],
      gifts: [],
    });
  });
  describe("music", () => {
    const parseMusic = (music: unknown) => contentDraftSchema.parse({ music }).music;
    const good = { path: "u1/i1/music-1.mp3", startSeconds: 30, fileName: "song.mp3" };

    test("keeps valid music", () => {
      expect(parseMusic(good)).toEqual(good);
    });
    test("drops traversal and empty paths", () => {
      expect(parseMusic({ ...good, path: "../x" })).toBeUndefined();
      expect(parseMusic({ ...good, path: "a/../x" })).toBeUndefined();
      expect(parseMusic({ ...good, path: "" })).toBeUndefined();
      expect(parseMusic({ ...good, path: "/x" })).toBeUndefined();
      expect(parseMusic({ ...good, path: "a/music-1.mp3" })).toBeUndefined();
      expect(parseMusic({ ...good, path: "u/i/music-123.mp3" })?.path).toBe("u/i/music-123.mp3");
    });
    test("clamps and floors startSeconds", () => {
      expect(parseMusic({ ...good, startSeconds: -5 })?.startSeconds).toBe(0);
      expect(parseMusic({ ...good, startSeconds: 900 })?.startSeconds).toBe(600);
      expect(parseMusic({ ...good, startSeconds: "abc" })?.startSeconds).toBe(0);
      expect(parseMusic({ ...good, startSeconds: 12.7 })?.startSeconds).toBe(12);
    });
    test("missing music leaves no key", () => {
      expect("music" in contentDraftSchema.parse({})).toBe(false);
      expect("music" in contentDraftSchema.parse({ music: "nope" })).toBe(false);
    });
    test("publish schema accepts content without music", () => {
      const r = contentPublishSchema.safeParse(withEvent());
      expect(r.success).toBe(true);
    });
  });
});
