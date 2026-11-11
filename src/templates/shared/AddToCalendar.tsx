import type { ReactNode } from "react";
import type { ViewEvent } from "@/components/invitations/types";
import { buildIcs, icsFileName } from "./ics";

/** Button that downloads an .ics file for the event; nothing when the date is empty. */
export function AddToCalendar({
  event,
  names,
  className,
  children,
}: {
  event: ViewEvent;
  names: string;
  className?: string;
  children: ReactNode;
}) {
  if (event.date === "") return null;

  function download() {
    const title = `${event.title} — ${names}`;
    const ics = buildIcs({
      uid: event.id,
      title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: [event.venueName, event.venueAddress].filter(Boolean).join(", "),
      ...(event.mapsUrl ? { description: event.mapsUrl } : {}),
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = icsFileName(title);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className={className}>
      {children}
    </button>
  );
}
