export type IcsInput = {
  uid: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
};

const DEFAULT_DURATION_MIN = 2 * 60;
const DAY_MIN = 24 * 60;
const MAX_OCTETS = 75;

const pad = (n: number) => String(n).padStart(2, "0");

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/[;,]/g, (c) => `\\${c}`)
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Fold a content line to at most 75 octets per physical line (RFC 5545 3.1). */
function fold(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= MAX_OCTETS) return line;
  const out: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    // continuation lines start with one space, which counts toward the limit
    const limit = out.length === 0 ? MAX_OCTETS : MAX_OCTETS - 1;
    if (size + bytes > limit) {
      out.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += bytes;
  }
  out.push(current);
  return out.join("\r\n ");
}

function parseDate(iso: string): Date {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

const dateStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;

function minutesOf(time: string): number {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

function utcStamp(d: Date): string {
  return `${dateStamp(d)}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** Build a single-event iCalendar file. Times are floating local time. */
export function buildIcs(input: IcsInput, now: Date = new Date()): string {
  const day = parseDate(input.date);
  let dtstart: string;
  let dtend: string;

  if (!input.startTime) {
    dtstart = `DTSTART;VALUE=DATE:${dateStamp(day)}`;
    dtend = `DTEND;VALUE=DATE:${dateStamp(addDays(day, 1))}`;
  } else {
    const start = minutesOf(input.startTime);
    let end = input.endTime ? minutesOf(input.endTime) : start + DEFAULT_DURATION_MIN;
    if (input.endTime && end < start) end += DAY_MIN;
    const endDay = addDays(day, Math.floor(end / DAY_MIN));
    const endOfDay = end % DAY_MIN;
    const time = (min: number) => `${pad(Math.floor(min / 60))}${pad(min % 60)}00`;
    dtstart = `DTSTART:${dateStamp(day)}T${time(start)}`;
    dtend = `DTEND:${dateStamp(endDay)}T${time(endOfDay)}`;
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WUMY//Invitation//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${input.uid}@wumy`,
    `DTSTAMP:${utcStamp(now)}`,
    dtstart,
    dtend,
    `SUMMARY:${escapeText(input.title)}`,
    ...(input.location ? [`LOCATION:${escapeText(input.location)}`] : []),
    ...(input.description ? [`DESCRIPTION:${escapeText(input.description)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function icsFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return `${slug || "undangan"}.ics`;
}
