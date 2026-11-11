import { describe, expect, test } from "vitest";
import type { InvitationViewModel } from "@/components/invitations/types";
import { sectionNumbers } from "./section-numbers";

const full = {
  greeting: "Assalamualaikum",
  quote: "",
  weddingDateIso: "2027-08-24",
  events: [{}] as InvitationViewModel["events"],
  story: "Kisah",
  photoUrls: ["a.jpg"],
  gifts: [{}] as InvitationViewModel["gifts"],
};

describe("modern sectionNumbers", () => {
  test("all sections present → 1..9", () => {
    expect(sectionNumbers(full)).toEqual({
      opening: 1,
      couple: 2,
      countdown: 3,
      events: 4,
      story: 5,
      gallery: 6,
      gifts: 7,
      rsvp: 8,
      closing: 9,
    });
  });

  test("hidden sections leave no gaps", () => {
    const { weddingDateIso: _omit, ...rest } = full;
    expect(sectionNumbers({ ...rest, greeting: " ", story: "", photoUrls: [] })).toEqual({
      couple: 1,
      events: 2,
      gifts: 3,
      rsvp: 4,
      closing: 5,
    });
  });
});
