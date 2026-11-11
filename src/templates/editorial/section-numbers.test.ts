import { describe, expect, test } from "vitest";
import type { InvitationViewModel } from "@/components/invitations/types";
import { sectionNumbers } from "./section-numbers";

const full = {
  weddingDateIso: "2027-08-24",
  events: [{}] as InvitationViewModel["events"],
  story: "Kisah",
  photoUrls: ["a.jpg"],
  gifts: [{}] as InvitationViewModel["gifts"],
};

describe("sectionNumbers", () => {
  test("all sections present → 1..7 in render order", () => {
    expect(sectionNumbers(full)).toEqual({
      couple: 1,
      countdown: 2,
      events: 3,
      story: 4,
      gallery: 5,
      gifts: 6,
      rsvp: 7,
    });
  });

  test("countdown and story missing → numbers stay consecutive", () => {
    const { weddingDateIso: _omit, ...rest } = full;
    expect(sectionNumbers({ ...rest, story: "  " })).toEqual({
      couple: 1,
      events: 2,
      gallery: 3,
      gifts: 4,
      rsvp: 5,
    });
  });
});
