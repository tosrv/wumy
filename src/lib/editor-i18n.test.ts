import { describe, expect, it, vi } from "vitest";
import { EDITOR_STRINGS, EditorError, editorErrorText, t } from "@/lib/editor-i18n";

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

describe("t with params", () => {
  it("fills placeholders", () => {
    expect(t("id", "photosUploaded", { n: 3 })).toBe("3 foto berhasil diunggah.");
    expect(t("en", "publishSuccess", { slug: "ayu-budi" })).toBe(
      "Your invitation is live at /ayu-budi",
    );
  });
});

describe("editorErrorText", () => {
  it("translates EditorError keys", () => {
    expect(
      editorErrorText(new EditorError("photoCapReached", { n: 6 }), "id", "photoUploadFailed"),
    ).toBe("Galeri sudah berisi 6 foto, jumlah maksimal.");
  });

  it("maps known database errors", () => {
    expect(
      editorErrorText(new Error("Payment required before publishing"), "id", "publishFailed"),
    ).toBe("Selesaikan pembayaran sebelum menerbitkan undangan.");
    expect(
      editorErrorText(
        new Error("An invitation can have at most 6 gallery photos"),
        "en",
        "photoUploadFailed",
      ),
    ).toBe("The gallery already has 6 photos, the maximum.");
  });

  it("falls back to a localized message for unknown errors", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(editorErrorText(new Error("fetch failed"), "id", "publishFailed")).toBe(
      "Gagal menerbitkan undangan.",
    );
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
