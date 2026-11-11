import type { InvitationViewModel } from "@/components/invitations/types";

export type RsvpHandler = (input: {
  guestName: string;
  status: "coming" | "not_coming";
  message: string;
  partySize: number;
}) => Promise<void>;

export type TemplateSkinProps = {
  data: InvitationViewModel;
  startOpened?: boolean;
  embedded?: boolean;
  onSubmitRsvp?: RsvpHandler;
  rsvpGuestName?: string;
  className?: string;
};
