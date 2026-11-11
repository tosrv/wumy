import { describe, expect, it } from "vitest";
import { emptyContent } from "@/lib/invitation-content";
import type { EditorFormValues } from "@/components/editor/editor-form";
import { collectPublishIssues } from "./publish-issues";
import { parseStepParam, stepStates, stepSummary } from "./step-states";

function blank(): EditorFormValues {
  return { ...emptyContent(), templateId: "", slug: "", story: "" };
}

function filled(): EditorFormValues {
  const v = blank();
  v.templateId = "minimal";
  v.slug = "ayu-budi";
  v.partners.a.nickname = "Ayu";
  v.partners.b.nickname = "Budi";
  v.events = [
    {
      id: "e1",
      kind: "akad",
      title: "Akad",
      date: "2027-08-24",
      startTime: "09:00",
      endTime: "",
      venueName: "Masjid",
      venueAddress: "",
      mapsUrl: "",
    },
    {
      id: "e2",
      kind: "resepsi",
      title: "Resepsi",
      date: "2027-08-24",
      startTime: "12:00",
      endTime: "",
      venueName: "Gedung",
      venueAddress: "",
      mapsUrl: "",
    },
  ];
  v.gifts = [
    { id: "g1", kind: "bank", bankName: "BCA", accountName: "Ayu", accountNumber: "1" },
    { id: "g2", kind: "ewallet", provider: "dana", accountName: "Budi", accountNumber: "2" },
  ];
  v.greeting = "Halo";
  return v;
}

const ctx = (v: EditorFormValues, galleryCount = 0) => ({
  issues: collectPublishIssues(v),
  galleryCount,
});

describe("stepStates", () => {
  it("marks optional empty steps as empty and missing required data as warning", () => {
    const v = blank();
    const s = stepStates(v, ctx(v));
    expect(s.template).toBe("empty");
    expect(s.partners).toBe("warning");
    expect(s.events).toBe("warning");
    expect(s.gallery).toBe("empty");
    expect(s.gifts).toBe("empty");
    expect(s.texts).toBe("empty");
    expect(s.review).toBe("warning");
  });

  it("marks filled steps complete; review never shows complete", () => {
    const v = filled();
    const s = stepStates(v, ctx(v, 2));
    expect(s).toEqual({
      template: "complete",
      partners: "complete",
      events: "complete",
      gallery: "complete",
      gifts: "complete",
      texts: "complete",
      review: "empty",
    });
  });

  it("gallery counts as complete with a story and no photos", () => {
    const v = blank();
    v.story = "Kisah kami";
    expect(stepStates(v, ctx(v, 0)).gallery).toBe("complete");
  });

  it("an incomplete gift turns the gifts step into a warning", () => {
    const v = filled();
    v.gifts = [{ id: "g1", kind: "bank", bankName: "", accountName: "", accountNumber: "" }];
    expect(stepStates(v, ctx(v)).gifts).toBe("warning");
  });
});

describe("stepSummary", () => {
  const sc = (v: EditorFormValues, galleryCount = 0) => ({
    galleryCount,
    templateName: v.templateId ? "Minimal" : undefined,
    locale: "id" as const,
  });

  it("summarises filled steps", () => {
    const v = filled();
    expect(stepSummary("template", v, sc(v))).toBe("Minimal");
    expect(stepSummary("partners", v, sc(v))).toBe("Ayu & Budi");
    expect(stepSummary("events", v, sc(v))).toBe("2 acara");
    expect(stepSummary("gallery", v, sc(v, 4))).toBe("4 foto");
    expect(stepSummary("gifts", v, sc(v))).toBe("BCA, DANA");
    expect(stepSummary("review", v, sc(v))).toBe("/ayu-budi");
  });

  it("falls back to 'Belum diisi' when empty", () => {
    const v = blank();
    for (const id of ["template", "partners", "events", "gallery", "gifts", "review"] as const) {
      expect(stepSummary(id, v, sc(v))).toBe("Belum diisi");
    }
  });

  it("uses English in the en locale", () => {
    const v = filled();
    const en = { galleryCount: 1, templateName: "Minimal", locale: "en" as const };
    expect(stepSummary("events", v, en)).toBe("2 events");
    expect(stepSummary("gallery", v, en)).toBe("1 photo");
  });
});

describe("parseStepParam", () => {
  it("accepts known step ids only", () => {
    expect(parseStepParam("events")).toBe("events");
    expect(parseStepParam("nope")).toBeUndefined();
    expect(parseStepParam(undefined)).toBeUndefined();
    expect(parseStepParam(3)).toBeUndefined();
  });
});
