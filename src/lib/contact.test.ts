import { describe, expect, it } from "vitest";
import { whatsappUrl } from "./contact";

describe("whatsappUrl", () => {
  it("links to the support number with an encoded message", () => {
    expect(whatsappUrl("Halo & tanya")).toBe("https://wa.me/6285138592489?text=Halo%20%26%20tanya");
  });
});
