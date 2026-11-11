import { describe, expect, it } from "vitest";
import { invitationStatusLabel } from "./invitationStatus";

describe("invitationStatusLabel", () => {
  it("archived", () => {
    expect(invitationStatusLabel({ status: "archived", payment_status: "paid" })).toBe(
      "Diarsipkan",
    );
  });
  it("published", () => {
    expect(invitationStatusLabel({ status: "published", payment_status: "paid" })).toBe("Tayang");
  });
  it("paid, not published", () => {
    expect(invitationStatusLabel({ status: "draft", payment_status: "paid" })).toBe(
      "Lunas — belum tayang",
    );
  });
  it("unpaid", () => {
    expect(invitationStatusLabel({ status: "draft", payment_status: "pending" })).toBe(
      "Menunggu pembayaran",
    );
  });
});
