import { describe, expect, test, vi } from "vitest";
import { emptyContent, type ContentEvent } from "@/lib/invitation-content";
import { invitationTemplates } from "@/data/templates";
import { parseDemoDate, viewModelFromCatalog, viewModelFromContent } from "./types";

vi.mock("@/lib/invitation-music", () => ({
  musicPublicUrl: (path: string) => `https://cdn.test/${path}`,
}));

const base = { templateId: "minimal", story: "", photos: [] };

const event = (over: Partial<ContentEvent> = {}): ContentEvent => ({
  id: "e1",
  kind: "resepsi",
  title: "Resepsi",
  date: "2027-08-24",
  startTime: "09:00",
  endTime: "11:00",
  venueName: "Gedung A",
  venueAddress: "Jl. Mawar 1",
  mapsUrl: "",
  ...over,
});

describe("viewModelFromContent", () => {
  test("no sample data leaks", () => {
    const vm = viewModelFromContent({ ...base, content: emptyContent() });
    expect(vm.gifts).toEqual([]);
    expect(vm.events).toEqual([]);
    expect(JSON.stringify(vm)).not.toContain("1234567890");
    expect(vm.partners.a.displayName).toBe("Mempelai 1");
    expect(vm.partners.b.displayName).toBe("Mempelai 2");
    expect(vm.weddingDateLabel).toBe("");
  });

  test("partner fallback names follow the invitation locale", () => {
    const vm = viewModelFromContent({ ...base, content: { ...emptyContent(), locale: "en" } });
    expect(vm.partners.a.displayName).toBe("Partner 1");
    expect(vm.partners.b.displayName).toBe("Partner 2");
  });

  test("timeLabel with end time", () => {
    const content = { ...emptyContent(), events: [event()] };
    const vm = viewModelFromContent({ ...base, content });
    expect(vm.events[0]?.timeLabel).toBe("09:00 – 11:00");
  });

  test("empty end time reads selesai / until end", () => {
    const events = [event({ endTime: "" })];
    const id = viewModelFromContent({
      ...base,
      content: { ...emptyContent(), events },
    });
    expect(id.events[0]?.timeLabel).toBe("09:00 – selesai");
    const en = viewModelFromContent({
      ...base,
      content: { ...emptyContent(), locale: "en", events },
    });
    expect(en.events[0]?.timeLabel).toBe("09:00 – until end");
  });

  test("dateLabel uses the locale long format and drives top-level fields", () => {
    const content = { ...emptyContent(), events: [event()] };
    const vm = viewModelFromContent({ ...base, content });
    const expected = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(2027, 7, 24));
    expect(vm.events[0]?.dateLabel).toBe(expected);
    expect(vm.events[0]?.dateLabel).toBe("Selasa, 24 Agustus 2027");
    expect(vm.weddingDateLabel).toBe(expected);
    expect(vm.weddingDateIso).toBe("2027-08-24");
    expect(vm.venueName).toBe("Gedung A");
  });

  test("photo roles map to partner/cover URLs and leave the gallery", () => {
    const vm = viewModelFromContent({
      ...base,
      content: emptyContent(),
      photos: [
        { url: "g1", role: "gallery" },
        { url: "a", role: "partner_a" },
        { url: "b", role: "partner_b" },
        { url: "c", role: "cover" },
        { url: "g2", role: "gallery" },
      ],
    });
    expect(vm.partners.a.photoUrl).toBe("a");
    expect(vm.partners.b.photoUrl).toBe("b");
    expect(vm.coverPhotoUrl).toBe("c");
    expect(vm.photoUrls).toEqual(["g1", "g2"]);
  });

  test("displayName prefers nickname, then full name", () => {
    const content = emptyContent();
    content.partners.a.nickname = "Ayu";
    content.partners.b.fullName = "Bima Sakti";
    const vm = viewModelFromContent({ ...base, content });
    expect(vm.partnerAName).toBe("Ayu");
    expect(vm.partnerBName).toBe("Bima Sakti");
  });
});

describe("viewModelFromContent closing", () => {
  test("passes through content.closing", () => {
    const content = { ...emptyContent(), closing: "Terima kasih" };
    expect(viewModelFromContent({ ...base, content }).closing).toBe("Terima kasih");
  });
  test("empty content gives empty string", () => {
    const content = { ...emptyContent(), closing: "" };
    expect(viewModelFromContent({ ...base, content }).closing).toBe("");
  });
});

describe("viewModelFromCatalog", () => {
  test.each(invitationTemplates.map((t) => [t.id, t] as const))(
    "%s demo yields a valid weddingDateIso",
    (_id, template) => {
      expect(viewModelFromCatalog(template).weddingDateIso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    },
  );
});

describe("music in view models", () => {
  test("content with music exposes url and startSeconds", () => {
    const content = {
      ...emptyContent(),
      music: { path: "u/i/music-1.mp3", startSeconds: 42, fileName: "a.mp3" },
    };
    const vm = viewModelFromContent({ ...base, content });
    expect(vm.music?.url.endsWith("u/i/music-1.mp3")).toBe(true);
    expect(vm.music?.startSeconds).toBe(42);
  });
  test("content without music has none", () => {
    expect(viewModelFromContent({ ...base, content: emptyContent() }).music).toBeUndefined();
  });
  test("catalog demo has the demo track", () => {
    const vm = viewModelFromCatalog(invitationTemplates[0]!);
    expect(vm.music).toEqual({ url: "/demo/music.mp3", startSeconds: 0 });
  });
});

describe("parseDemoDate", () => {
  test.each([
    ["24 AUGUST 2027", "2027-08-24"],
    ["24.08.27", "2027-08-24"],
    ["SEPTEMBER 12, 2027", "2027-09-12"],
    ["06 / 09 / 27", "2027-09-06"],
    ["15 · 11 · 2027", "2027-11-15"],
    ["20 Desember 2026", "2026-12-20"],
  ])("%s → %s", (label, iso) => {
    expect(parseDemoDate(label)).toBe(iso);
  });

  test("unreadable or impossible labels yield undefined", () => {
    expect(parseDemoDate("Sabtu 12")).toBeUndefined();
    expect(parseDemoDate("31 / 02 / 27")).toBeUndefined();
    expect(parseDemoDate("")).toBeUndefined();
  });

  test("playful demo counts down to its own date", () => {
    const playful = invitationTemplates.find((t) => t.id === "playful")!;
    expect(viewModelFromCatalog(playful).weddingDateIso).toBe("2027-09-06");
  });
});
