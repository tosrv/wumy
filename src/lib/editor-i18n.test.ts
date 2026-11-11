import { describe, expect, it } from "vitest";
import { EDITOR_STRINGS, t } from "@/lib/editor-i18n";

describe("editor i18n", () => {
  it("every key exists in both locales", () => {
    const idKeys = Object.keys(EDITOR_STRINGS.id).sort();
    const enKeys = Object.keys(EDITOR_STRINGS.en).sort();
    expect(idKeys).toEqual(enKeys);
    for (const locale of ["id", "en"] as const) {
      for (const key of idKeys) {
        expect(EDITOR_STRINGS[locale][key as keyof typeof EDITOR_STRINGS.id].trim()).not.toBe("");
      }
    }
  });

  it("translates save states", () => {
    expect(t("id", "saving")).toBe("Menyimpan…");
    expect(t("en", "saving")).toBe("Saving…");
    expect(t("id", "saved")).toBe("Tersimpan");
    expect(t("en", "saved")).toBe("Saved");
    expect(t("id", "saveFailed")).toBe("Gagal menyimpan");
    expect(t("en", "saveFailed")).toBe("Save failed");
  });
});

describe("partner labels", () => {
  it("do not assume gender", () => {
    expect(t("id", "partnerA")).toBe("Mempelai 1");
    expect(t("id", "partnerB")).toBe("Mempelai 2");
    expect(t("en", "partnerA")).toBe("Partner 1");
    expect(t("en", "partnerB")).toBe("Partner 2");
    for (const locale of ["id", "en"] as const) {
      for (const key of ["partnerA", "partnerB", "issuePartnerA", "issuePartnerB"] as const) {
        expect(t(locale, key)).not.toMatch(/wanita|pria|bride|groom/i);
      }
    }
  });
});
