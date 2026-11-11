import { describe, expect, test } from "vitest";
import { emptyContent } from "./invitation-content";
import { LEGACY_EVENT_ID, legacyColumnsFromContent, parseContent } from "./invitation-content-io";

const legacy = {
  partner_a_name: "Ayu",
  partner_b_name: "Bima",
  wedding_date: "2027-08-24" as string | null,
  venue_name: "Gedung A",
  venue_address: "Jl. Mawar 1",
};

describe("parseContent", () => {
  test("legacy row synthesizes one resepsi event", () => {
    const c = parseContent({ ...legacy, content: {} });
    expect(c.events).toHaveLength(1);
    expect(c.events[0]).toMatchObject({
      id: "legacy-event",
      kind: "resepsi",
      title: "Resepsi",
      date: "2027-08-24",
      venueName: "Gedung A",
      venueAddress: "Jl. Mawar 1",
      startTime: "",
      endTime: "",
    });
    expect(c.partners.a.nickname).toBe("Ayu");
    expect(c.partners.b.nickname).toBe("Bima");
  });

  test("legacy event id is stable across parses", () => {
    const row = { ...legacy, content: {} };
    expect(parseContent(row).events[0]?.id).toBe(LEGACY_EVENT_ID);
    expect(parseContent(row).events[0]?.id).toBe(parseContent(row).events[0]?.id);
  });

  test("english locale titles the legacy event Reception", () => {
    const c = parseContent({ ...legacy, content: { locale: "en" } });
    expect(c.events[0]?.title).toBe("Reception");
  });

  test("invalid fields fall back", () => {
    const c = parseContent({ ...legacy, content: { religion: 5, events: "x" } });
    expect(c.religion).toBe("umum");
    expect(c.events).toHaveLength(1);
    expect(c.events[0]?.venueName).toBe("Gedung A");
  });

  test("content wins over legacy", () => {
    const c = parseContent({
      ...legacy,
      content: {
        partners: { a: { nickname: "Sari" }, b: {} },
        events: [{ id: "e1", kind: "akad", date: "2028-01-02", venueName: "Masjid" }],
      },
    });
    expect(c.partners.a.nickname).toBe("Sari");
    expect(c.partners.b.nickname).toBe("Bima");
    expect(c.events).toHaveLength(1);
    expect(c.events[0]).toMatchObject({ id: "e1", kind: "akad", venueName: "Masjid" });
  });

  test("no legacy data and no content yields no events", () => {
    const c = parseContent({
      partner_a_name: "",
      partner_b_name: "",
      wedding_date: null,
      venue_name: "",
      venue_address: "",
      content: null,
    });
    expect(c.events).toEqual([]);
  });
});

describe("legacyColumnsFromContent", () => {
  test("uses first event and nickname||fullName", () => {
    const c = emptyContent();
    c.partners.a.nickname = "Ayu";
    c.partners.b.fullName = "Bima Sakti";
    c.events = [
      {
        id: "1",
        kind: "akad",
        title: "",
        date: "2027-08-24",
        startTime: "08:00",
        endTime: "",
        venueName: "Masjid",
        venueAddress: "Jl. A",
        mapsUrl: "",
      },
    ];
    expect(legacyColumnsFromContent(c)).toEqual({
      partner_a_name: "Ayu",
      partner_b_name: "Bima Sakti",
      wedding_date: "2027-08-24",
      venue_name: "Masjid",
      venue_address: "Jl. A",
    });
  });

  test("wedding_date is null with no events", () => {
    expect(legacyColumnsFromContent(emptyContent()).wedding_date).toBeNull();
  });
});
