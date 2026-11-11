import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Locale } from "@/lib/invitation-content";
import { templateLabel } from "../labels";
import type { RsvpHandler } from "./types";

export type RsvpStatus = "coming" | "not_coming";

export type RsvpFormApi = {
  guestName: string;
  setGuestName: (v: string) => void;
  status: RsvpStatus | null;
  setStatus: (v: RsvpStatus) => void;
  message: string;
  setMessage: (v: string) => void;
  partySize: number;
  setPartySize: (v: number) => void;
  submit: (e?: FormEvent) => Promise<void>;
  busy: boolean;
  error: string | null;
  done: boolean;
  enabled: boolean;
};

/** Headless RSVP state; markup comes from the `children` render prop. */
export function RsvpForm({
  onSubmit,
  initialGuestName,
  locale,
  children,
}: {
  onSubmit?: RsvpHandler;
  initialGuestName?: string;
  locale: Locale;
  children: (api: RsvpFormApi) => ReactNode;
}) {
  const [guestName, setGuestName] = useState(initialGuestName ?? "");
  const [status, setStatus] = useState<RsvpStatus | null>(null);
  const [message, setMessage] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (initialGuestName) setGuestName(initialGuestName);
  }, [initialGuestName]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!onSubmit) return;
    if (!status) {
      setError(templateLabel(locale, "rsvpPickStatus"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ guestName, status, message, partySize });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : templateLabel(locale, "rsvpFailed"));
    } finally {
      setBusy(false);
    }
  }

  return children({
    guestName,
    setGuestName,
    status,
    setStatus,
    message,
    setMessage,
    partySize,
    setPartySize,
    submit,
    busy,
    error,
    done,
    enabled: Boolean(onSubmit),
  });
}
