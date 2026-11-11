import { describe, expect, it } from "vitest";
import { emptyContent } from "./invitation-content";
import { applyPreset, getPreset, textsDifferFromPreset } from "./invitation-presets";

const titles = (r: Parameters<typeof getPreset>[0], l: Parameters<typeof getPreset>[1]) =>
  getPreset(r, l).events.map((e) => e.title);

describe("getPreset", () => {
  it("islam/id", () => {
    expect(titles("islam", "id")).toEqual(["Akad Nikah", "Resepsi"]);
    expect(getPreset("islam", "id").quoteSource).toContain("Ar-Rum 30:21");
  });
  it("islam/en", () => {
    expect(titles("islam", "en")).toEqual(["Akad Nikah", "Reception"]);
  });
  it("quote sources per religion", () => {
    expect(getPreset("kristen", "id").quoteSource).toContain("Kejadian 2:24");
    expect(getPreset("katolik", "id").quoteSource).toContain("Markus 10:9");
    expect(getPreset("katolik", "id").quote).toBe(
      "Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
    );
    expect(getPreset("hindu", "id").quoteSource).toBe("Rig Veda X.85.36 (disarikan)");
    expect(getPreset("hindu", "en").quoteSource).toBe("Rig Veda X.85.36 (paraphrased)");
    expect(getPreset("buddha", "id").quoteSource).toBe("Sigalovada Sutta (disarikan)");
    expect(getPreset("buddha", "en").quoteSource).toBe("Sigalovada Sutta (paraphrased)");
    expect(getPreset("hindu", "id").quoteSource).toContain("Rig Veda");
    expect(getPreset("buddha", "id").quoteSource).toContain("Sigalovada");
  });
  it("katolik title and kinds", () => {
    expect(titles("katolik", "id")).toEqual(["Sakramen Pernikahan", "Resepsi"]);
    expect(getPreset("katolik", "id").events.map((e) => e.kind)).toEqual([
      "pemberkatan",
      "resepsi",
    ]);
    expect(getPreset("hindu", "id").events[0]?.kind).toBe("other");
  });
  it("umum has a single reception and no quote", () => {
    const p = getPreset("umum", "id");
    expect(p.events.map((e) => e.title)).toEqual(["Resepsi"]);
    expect(p.quote).toBe("");
    expect(p.quoteSource).toBe("");
  });
  it("every preset has greeting and closing", () => {
    for (const r of ["islam", "kristen", "katolik", "hindu", "buddha", "umum"] as const)
      for (const l of ["id", "en"] as const) {
        expect(getPreset(r, l).greeting).not.toBe("");
        expect(getPreset(r, l).closing).not.toBe("");
      }
  });
});

describe("applyPreset", () => {
  it("fills empty texts and adds events when none", () => {
    const out = applyPreset(emptyContent(), getPreset("islam", "id"));
    expect(out.events).toHaveLength(2);
    expect(out.events[0]).toMatchObject({
      kind: "akad",
      date: "",
      startTime: "",
      endTime: "",
      venueName: "",
      venueAddress: "",
      mapsUrl: "",
    });
    expect(out.events[0]?.id).toBeTruthy();
    expect(out.events[0]?.id).not.toBe(out.events[1]?.id);
    expect(out.quoteSource).toContain("Ar-Rum");
  });
  it("keeps user greeting", () => {
    const c = { ...emptyContent(), greeting: "Halo!" };
    expect(applyPreset(c, getPreset("islam", "id")).greeting).toBe("Halo!");
  });
  it("does not add events when some exist", () => {
    const base = applyPreset(emptyContent(), getPreset("umum", "id"));
    const out = applyPreset(base, getPreset("islam", "id"));
    expect(out.events).toEqual(base.events);
  });
  it("overwriteTexts replaces texts but not events", () => {
    const base = applyPreset({ ...emptyContent(), greeting: "Halo!" }, getPreset("umum", "id"));
    const out = applyPreset(base, getPreset("kristen", "id"), { overwriteTexts: true });
    expect(out.greeting).toBe(getPreset("kristen", "id").greeting);
    expect(out.quoteSource).toContain("Kejadian");
    expect(out.events).toEqual(base.events);
  });
  it("does not mutate input", () => {
    const c = emptyContent();
    applyPreset(c, getPreset("islam", "id"));
    expect(c.events).toHaveLength(0);
  });
});

describe("textsDifferFromPreset", () => {
  it("false when all empty", () => {
    expect(textsDifferFromPreset(emptyContent())).toBe(false);
  });
  it("false when matching preset", () => {
    const c = applyPreset({ ...emptyContent(), religion: "islam" }, getPreset("islam", "id"));
    expect(textsDifferFromPreset(c)).toBe(false);
  });
  it("true when edited", () => {
    const c = {
      ...applyPreset({ ...emptyContent(), religion: "islam" }, getPreset("islam", "id")),
      closing: "Custom",
    };
    expect(textsDifferFromPreset(c)).toBe(true);
  });
  it("true when only the quote source is edited", () => {
    const c = {
      ...applyPreset({ ...emptyContent(), religion: "islam" }, getPreset("islam", "id")),
      quoteSource: "Custom source",
    };
    expect(textsDifferFromPreset(c)).toBe(true);
  });
  it("true for custom quote under umum", () => {
    expect(textsDifferFromPreset({ ...emptyContent(), quote: "x" })).toBe(true);
  });
});
