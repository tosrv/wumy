import { describe, expect, test } from "vitest";
import { buildIcs, icsFileName } from "./ics";

const base = {
  uid: "e1",
  title: "Resepsi",
  date: "2027-08-24",
  startTime: "09:00",
  endTime: "11:00",
  location: "Gedung A",
};
const now = new Date(Date.UTC(2027, 0, 2, 3, 4, 5));

describe("buildIcs", () => {
  test("timed event", () => {
    const ics = buildIcs(base, now);
    expect(ics).toContain("DTSTART:20270824T090000");
    expect(ics).toContain("DTEND:20270824T110000");
    expect(ics).toContain("UID:e1@wumy");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("CALSCALE:GREGORIAN");
    expect(ics).toContain("PRODID:-//WUMY//Invitation//ID");
    expect(ics).toContain("DTSTAMP:20270102T030405Z");
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  test("missing end defaults to start + 2h", () => {
    expect(buildIcs({ ...base, endTime: "" }, now)).toContain("DTEND:20270824T110000");
  });

  test("start + 2h crossing midnight rolls the date", () => {
    const ics = buildIcs({ ...base, startTime: "23:00", endTime: "" }, now);
    expect(ics).toContain("DTEND:20270825T010000");
  });

  test("end earlier than start is next day", () => {
    const ics = buildIcs({ ...base, startTime: "22:00", endTime: "01:00" }, now);
    expect(ics).toContain("DTEND:20270825T010000");
  });

  test("all-day", () => {
    const ics = buildIcs({ ...base, startTime: "", endTime: "" }, now);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270824");
    expect(ics).toContain("DTEND;VALUE=DATE:20270825");
  });

  test("all-day at month end rolls month", () => {
    const ics = buildIcs({ ...base, date: "2027-12-31", startTime: "" }, now);
    expect(ics).toContain("DTEND;VALUE=DATE:20280101");
  });

  test("escaping", () => {
    const ics = buildIcs(
      { ...base, location: "Gedung A, Lt. 2; Jakarta", description: "a\\b\nc" },
      now,
    );
    expect(ics).toContain("LOCATION:Gedung A\\, Lt. 2\\; Jakarta");
    expect(ics).toContain("DESCRIPTION:a\\\\b\\nc");
  });

  test("folds long lines at 75 octets", () => {
    const ics = buildIcs({ ...base, description: "x".repeat(200) }, now);
    for (const line of ics.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain(`DESCRIPTION:${"x".repeat(200)}`);
  });

  test("folding never splits a multi-byte character", () => {
    const title = "é".repeat(100);
    const description = "—".repeat(60);
    const ics = buildIcs({ ...base, title, description }, now);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8", { fatal: true });
    for (const line of ics.split("\r\n")) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
      expect(() => decoder.decode(encoder.encode(line))).not.toThrow();
    }
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain(`SUMMARY:${title}`);
    expect(unfolded).toContain(`DESCRIPTION:${description}`);
  });
});

describe("icsFileName", () => {
  test("slugifies", () => {
    expect(icsFileName("Akad Nikah — Sinta & Rama")).toBe("akad-nikah-sinta-rama.ics");
  });
  test("fallback", () => {
    expect(icsFileName("")).toBe("undangan.ics");
    expect(icsFileName("— &")).toBe("undangan.ics");
  });
  test("max 60 chars", () => {
    expect(icsFileName("a".repeat(100))).toBe(`${"a".repeat(60)}.ics`);
  });
});
