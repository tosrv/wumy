import { describe, expect, it } from "vitest";
import { isSafeNextPath } from "./safe-redirect";

describe("isSafeNextPath", () => {
  it("accepts same-origin paths", () => {
    expect(isSafeNextPath("/dashboard")).toBe(true);
    expect(isSafeNextPath("/order?template=a")).toBe(true);
    expect(isSafeNextPath("/order?template=romantic%20x")).toBe(true);
    expect(isSafeNextPath("/editor/1a2b3c4d-1111-2222-3333-444455556666")).toBe(true);
    expect(isSafeNextPath("/%2F%2Fevil.com")).toBe(true); // stays same-origin
  });

  it("rejects protocol-relative, backslash and absolute URLs", () => {
    for (const v of [
      "//evil.com",
      "/\\evil.com",
      "https://evil.com",
      "evil.com",
      "",
      undefined,
      1,
    ]) {
      expect(isSafeNextPath(v)).toBe(false);
    }
  });

  it("rejects control characters that URL parsing would strip", () => {
    for (const v of ["/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/\u0000/x", "/\u007f/x"]) {
      expect(isSafeNextPath(v)).toBe(false);
    }
    // The router decodes ?next=/%09/evil.com to "/\t/evil.com" before validation.
    expect(isSafeNextPath(decodeURIComponent("/%09/evil.com"))).toBe(false);
  });
});
