import { describe, expect, test } from "vitest";
import type { Partner } from "@/lib/invitation-content";
import { parentsLine, TEMPLATE_LABEL_KEYS, templateLabel } from "./labels";

const partner = (over: Partial<Partner> = {}): Partner => ({
  fullName: "",
  nickname: "",
  fatherName: "",
  motherName: "",
  childOrder: "",
  ...over,
});

describe("templateLabel", () => {
  test.each(TEMPLATE_LABEL_KEYS)("%s exists in both locales", (key) => {
    expect(templateLabel("id", key).trim()).not.toBe("");
    expect(templateLabel("en", key).trim()).not.toBe("");
  });

  test("copy toast texts", () => {
    expect(templateLabel("id", "copiedNumber")).toBe("Nomor disalin");
    expect(templateLabel("en", "copiedNumber")).toBe("Number copied");
    expect(templateLabel("id", "copyFailed")).toBe("Gagal menyalin");
    expect(templateLabel("en", "copyFailed")).toBe("Copy failed");
  });
});

describe("parentsLine", () => {
  test("null when no parent filled", () => {
    expect(parentsLine("id", partner({ childOrder: "2" }))).toBeNull();
  });
  test("id full", () => {
    expect(
      parentsLine("id", partner({ fatherName: "Budi", motherName: "Sari", childOrder: "2" })),
    ).toBe("Putra/Putri ke-2 dari Bapak Budi & Ibu Sari");
  });
  test("id without child order", () => {
    expect(parentsLine("id", partner({ fatherName: "Budi", motherName: "Sari" }))).toBe(
      "Putra/Putri dari Bapak Budi & Ibu Sari",
    );
  });
  test("single parent", () => {
    expect(parentsLine("id", partner({ motherName: "Sari", childOrder: "1" }))).toBe(
      "Putra/Putri ke-1 dari Ibu Sari",
    );
    expect(parentsLine("en", partner({ fatherName: "Budi" }))).toBe("Child of Mr. Budi");
  });
  test("en full", () => {
    expect(
      parentsLine("en", partner({ fatherName: "Budi", motherName: "Sari", childOrder: "2" })),
    ).toBe("Child #2 of Mr. Budi & Mrs. Sari");
  });
});
