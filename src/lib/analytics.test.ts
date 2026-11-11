import { describe, expect, it } from "vitest";
import { sanitizeProps, track, scrubCapture, scrubUrl, trackablePath } from "./analytics";

describe("sanitizeProps", () => {
  it("keeps only allowlisted primitive props", () => {
    expect(
      sanitizeProps({
        template: "minimal",
        amount: 99000,
        email: "a@b.c",
        name: "Ayu",
        source: {},
      }),
    ).toEqual({ template: "minimal", amount: 99000 });
  });
});

describe("track", () => {
  it("accepts the new funnel events", () => {
    expect(() => track("order_view", { template: "minimal" })).not.toThrow();
    expect(() => track("published")).not.toThrow();
    expect(sanitizeProps({ template: "minimal" })).toEqual({ template: "minimal" });
  });
});

describe("trackablePath", () => {
  it("tracks site and app pages", () => {
    expect(trackablePath("/")).toBe("/");
    expect(trackablePath("/product")).toBe("/product");
    expect(trackablePath("/demo/minimal")).toBe("/demo/minimal");
  });

  it("masks ids and drops the query string", () => {
    expect(trackablePath("/editor/1a2b3c4d-1111-2222-3333-444455556666?step=events")).toBe(
      "/editor/:id",
    );
    expect(trackablePath("/payment/status?invoice=WUMY123")).toBe("/payment/status");
  });

  it("never tracks public invitations (guest names live in ?to=)", () => {
    expect(trackablePath("/ayu-budi")).toBeNull();
    expect(trackablePath("/ayu-budi?to=Pak-Joko")).toBeNull();
  });
});

describe("scrubUrl", () => {
  it("drops query and hash and masks ids", () => {
    expect(scrubUrl("https://www.wumy.my.id/demo/romantic?to=Pak-Joko#x")).toBe(
      "https://www.wumy.my.id/demo/romantic",
    );
    expect(
      scrubUrl("https://www.wumy.my.id/editor/1a2b3c4d-1111-2222-3333-444455556666?step=gifts"),
    ).toBe("https://www.wumy.my.id/editor/:id");
  });

  it("hides invitation slugs", () => {
    expect(scrubUrl("https://www.wumy.my.id/ayu-budi?to=Pak-Joko")).toBe(
      "https://www.wumy.my.id/[invitation]",
    );
    expect(scrubUrl("/ayu-budi")).toBe("/[invitation]");
  });

  it("leaves non-URL values alone", () => {
    expect(scrubUrl("$direct")).toBe("$direct");
  });
});

describe("scrubCapture", () => {
  it("scrubs URL-like properties everywhere on the event", () => {
    const cr = scrubCapture({
      properties: {
        $current_url: "https://w.id/demo/minimal?to=Ayu",
        $referrer: "https://w.id/ayu-budi?to=Ayu",
        template: "minimal",
      },
      $set_once: { $initial_current_url: "https://w.id/faq?q=refund" },
    });
    expect(cr.properties).toEqual({
      $current_url: "https://w.id/demo/minimal",
      $referrer: "https://w.id/[invitation]",
      template: "minimal",
    });
    expect(cr.$set_once).toEqual({ $initial_current_url: "https://w.id/faq" });
  });
});
