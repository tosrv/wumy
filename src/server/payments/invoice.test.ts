import { describe, expect, it } from "vitest";
import { buildInvoiceNumber } from "./invoice";

const ID = "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed";

describe("buildInvoiceNumber", () => {
  it("is WUMY + 8 hex of the id + base36 time, alphanumeric and <= 30", () => {
    const n = buildInvoiceNumber(ID, new Date(1_794_000_000_000));
    expect(n.startsWith("WUMY1B9D6BCD")).toBe(true);
    expect(n).toMatch(/^[A-Z0-9]{1,30}$/);
    expect(n).toBe("WUMY1B9D6BCDMW5HA39C");
  });

  it("differs for different times", () => {
    expect(buildInvoiceNumber(ID, new Date(1_794_000_000_000))).not.toBe(
      buildInvoiceNumber(ID, new Date(1_794_000_001_000)),
    );
  });
});
