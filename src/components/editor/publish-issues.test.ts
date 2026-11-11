import { describe, expect, it } from "vitest";
import { emptyContent } from "@/lib/invitation-content";
import type { EditorFormValues } from "@/components/editor/editor-form";
import { collectPublishIssues, isLiveSaveBlocked } from "./publish-issues";

function validValues(): EditorFormValues {
  const c = emptyContent();
  c.partners.a.nickname = "Ayu";
  c.partners.b.nickname = "Budi";
  c.events = [
    {
      id: "e1",
      kind: "resepsi",
      title: "Resepsi",
      date: "2027-01-02",
      startTime: "10:00",
      endTime: "",
      venueName: "Gedung",
      venueAddress: "",
      mapsUrl: "",
    },
  ];
  return { ...c, templateId: "minimal", slug: "ayu-budi", story: "" };
}

describe("collectPublishIssues", () => {
  it("returns no issues for publishable values", () => {
    expect(collectPublishIssues(validValues())).toEqual([]);
  });

  it("maps partner issues to the partners step", () => {
    const v = validValues();
    v.partners.b.nickname = "";
    expect(collectPublishIssues(v)).toEqual([{ step: "partners", key: "issuePartnerB" }]);
  });

  it("maps a missing event list and event fields to the events step", () => {
    const v = validValues();
    v.events = [];
    expect(collectPublishIssues(v)).toEqual([{ step: "events", key: "issueNoEvents" }]);

    const w = validValues();
    w.events[0]!.date = "";
    w.events[0]!.venueName = " ";
    w.events[0]!.mapsUrl = "http://x.com";
    expect(collectPublishIssues(w)).toEqual([
      { step: "events", key: "issueEventDate", index: 1 },
      { step: "events", key: "issueEventVenue", index: 1 },
      { step: "events", key: "issueEventMaps", index: 1 },
    ]);
  });

  it("maps incomplete gifts to the gifts step, once per gift", () => {
    const v = validValues();
    v.gifts = [{ id: "g1", kind: "bank", bankName: "", accountName: "", accountNumber: "1" }];
    expect(collectPublishIssues(v)).toEqual([
      { step: "gifts", key: "issueGiftIncomplete", index: 1 },
    ]);
  });

  it("maps an invalid slug to the review step", () => {
    const v = validValues();
    v.slug = "a";
    expect(collectPublishIssues(v)).toEqual([{ step: "review", key: "issueSlug" }]);
  });
});

describe("isLiveSaveBlocked", () => {
  it("blocks invalid content on a published invitation", () => {
    const v = validValues();
    v.events = [];
    expect(isLiveSaveBlocked("published", v)).toBe(true);
  });

  it("allows valid content on a published invitation", () => {
    expect(isLiveSaveBlocked("published", validValues())).toBe(false);
  });

  it("allows invalid content on a draft", () => {
    const v = validValues();
    v.events = [];
    expect(isLiveSaveBlocked("draft", v)).toBe(false);
  });

  it("ignores the slug, which is saved separately", () => {
    expect(isLiveSaveBlocked("published", { ...validValues(), slug: "x" })).toBe(false);
  });
});
