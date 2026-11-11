import type { InvitationTemplate } from "@/data/templates";
import { musicPublicUrl } from "@/lib/invitation-music";
import type {
  ContentEvent,
  Gift,
  InvitationContent,
  Locale,
  Partner,
  PhotoRole,
} from "@/lib/invitation-content";

export type ViewEvent = ContentEvent & { dateLabel: string; timeLabel: string };
export type ViewPartner = Partner & { displayName: string; photoUrl?: string };

/** Normalized data every invitation template renderer accepts. */
export type InvitationViewModel = {
  templateId: string;
  locale: Locale;
  partners: { a: ViewPartner; b: ViewPartner };
  partnerAName: string;
  partnerBName: string;
  /** First event's long date label; "" when there are no events */
  weddingDateLabel: string;
  /** ISO date `YYYY-MM-DD` for countdown; optional if unknown */
  weddingDateIso?: string;
  venueName: string;
  venueAddress: string;
  story: string;
  coverPhotoUrl?: string;
  /** Gallery photos only (partner/cover photos are excluded). */
  photoUrls: string[];
  quote: string;
  quoteSource: string;
  greeting: string;
  closing: string;
  events: ViewEvent[];
  gifts: Gift[];
  /** Background music; omitted when the invitation has none. */
  music?: { url: string; startSeconds: number };
  /** From `?to=` — shown as guest greeting when present. */
  guestName?: string;
};

export function splitCoupleLabel(couple: string): {
  partnerAName: string;
  partnerBName: string;
} {
  const normalized = couple.replace(/\n/g, " ").trim();
  const parts = normalized
    .split(/\s*(?:\/|&|\+|×)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    partnerAName: parts[0] ?? "Mempelai 1",
    partnerBName: parts[1] ?? "Mempelai 2",
  };
}

type CashlessGift = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

/** Bank and e-wallet gifts in one shape (e-wallet provider shown as the bank name). */
export function cashlessGifts(gifts: Gift[]): CashlessGift[] {
  const out: CashlessGift[] = [];
  for (const g of gifts) {
    if (g.kind === "bank") out.push(g);
    else if (g.kind === "ewallet") out.push({ ...g, bankName: g.provider.toUpperCase() });
  }
  return out;
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function dateLabel(iso: string, locale: Locale): string {
  const m = DATE_RE.exec(iso);
  if (!m) return "";
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function timeLabel(start: string, end: string, locale: Locale): string {
  if (!start) return "";
  const until = locale === "en" ? "until end" : "selesai";
  return `${start} – ${end || until}`;
}

function viewEvent(event: ContentEvent, locale: Locale): ViewEvent {
  return {
    ...event,
    dateLabel: dateLabel(event.date, locale),
    timeLabel: timeLabel(event.startTime, event.endTime, locale),
  };
}

/** Gender-neutral placeholder names shown when a partner's name is still empty. */
export function partnerFallbackNames(locale: Locale): [string, string] {
  return locale === "en" ? ["Partner 1", "Partner 2"] : ["Mempelai 1", "Mempelai 2"];
}

function viewPartner(partner: Partner, fallback: string, photoUrl?: string): ViewPartner {
  return {
    ...partner,
    displayName: partner.nickname || partner.fullName || fallback,
    ...(photoUrl ? { photoUrl } : {}),
  };
}

export function viewModelFromContent(input: {
  templateId: string;
  content: InvitationContent;
  story: string;
  photos: { url: string; role: PhotoRole }[];
  guestName?: string;
}): InvitationViewModel {
  const { content, photos } = input;
  const urlFor = (role: PhotoRole) => photos.find((p) => p.role === role)?.url;
  const [fallbackA, fallbackB] = partnerFallbackNames(content.locale);
  const a = viewPartner(content.partners.a, fallbackA, urlFor("partner_a"));
  const b = viewPartner(content.partners.b, fallbackB, urlFor("partner_b"));
  const events = content.events.map((e) => viewEvent(e, content.locale));
  const first = events[0];
  const coverPhotoUrl = urlFor("cover");
  const musicUrl = content.music ? musicPublicUrl(content.music.path) : "";

  return {
    templateId: input.templateId,
    locale: content.locale,
    partners: { a, b },
    partnerAName: a.displayName,
    partnerBName: b.displayName,
    weddingDateLabel: first?.dateLabel ?? "",
    ...(first && DATE_RE.test(first.date) ? { weddingDateIso: first.date } : {}),
    venueName: first?.venueName ?? "",
    venueAddress: first?.venueAddress ?? "",
    story: input.story.trim(),
    ...(coverPhotoUrl ? { coverPhotoUrl } : {}),
    photoUrls: photos.filter((p) => p.role === "gallery").map((p) => p.url),
    quote: content.quote,
    quoteSource: content.quoteSource,
    greeting: content.greeting,
    closing: content.closing,
    events,
    gifts: content.gifts,
    ...(content.music && musicUrl
      ? { music: { url: musicUrl, startSeconds: content.music.startSeconds } }
      : {}),
    ...(input.guestName ? { guestName: input.guestName } : {}),
  };
}

const MONTHS: Record<string, number> = {
  januari: 1,
  january: 1,
  jan: 1,
  februari: 2,
  february: 2,
  feb: 2,
  maret: 3,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  mei: 5,
  may: 5,
  juni: 6,
  june: 6,
  jun: 6,
  juli: 7,
  july: 7,
  jul: 7,
  agustus: 8,
  august: 8,
  agu: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  oktober: 10,
  october: 10,
  okt: 10,
  oct: 10,
  november: 11,
  nov: 11,
  desember: 12,
  december: 12,
  des: 12,
  dec: 12,
};

function isoIfValid(year: number, month: number, day: number): string | undefined {
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return undefined;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const fullYear = (y: string) => (y.length === 2 ? 2000 + Number(y) : Number(y));

/**
 * Read a catalog demo date label ("24 AUGUST 2027", "SEPTEMBER 12, 2027",
 * "24.08.27", "06 / 09 / 27", "20 Desember 2026") into `YYYY-MM-DD`.
 * Numeric forms are day / month / year. Unreadable labels yield undefined.
 */
export function parseDemoDate(label: string): string | undefined {
  const text = label.trim().toLowerCase();
  const named = /^(?:(\d{1,2})\s+([a-z]+)|([a-z]+)\s+(\d{1,2}),?)\s+(\d{4}|\d{2})$/.exec(text);
  if (named) {
    const month = MONTHS[named[2] ?? named[3] ?? ""];
    const day = Number(named[1] ?? named[4]);
    return month ? isoIfValid(fullYear(named[5]!), month, day) : undefined;
  }
  const numeric = /^(\d{1,2})\s*[./·-]\s*(\d{1,2})\s*[./·-]\s*(\d{4}|\d{2})$/.exec(text);
  if (numeric) return isoIfValid(fullYear(numeric[3]!), Number(numeric[2]), Number(numeric[1]));
  return undefined;
}

export function viewModelFromCatalog(
  template: InvitationTemplate,
  guestName?: string,
): InvitationViewModel {
  const { partnerAName, partnerBName } = splitCoupleLabel(template.couple);
  const [venueName = "", venueAddress = ""] = template.place.split("·").map((part) => part.trim());
  const weddingDateIso = parseDemoDate(template.date);
  const emptyPartner: Partner = {
    fullName: "",
    nickname: "",
    fatherName: "",
    motherName: "",
    childOrder: "",
  };

  const place = venueName || "Venue";
  const mapsQuery = encodeURIComponent([place, venueAddress].filter(Boolean).join(", "));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const demoEvent = (
    id: string,
    kind: ContentEvent["kind"],
    title: string,
    time: string,
  ): ViewEvent => ({
    id,
    kind,
    title,
    date: weddingDateIso ?? "",
    startTime: time,
    endTime: "",
    venueName: place,
    venueAddress,
    mapsUrl,
    dateLabel: template.date || "Date TBD",
    timeLabel: time,
  });
  const gifts: Gift[] = [
    {
      id: "demo-bca",
      kind: "bank",
      bankName: "BCA",
      accountName: partnerAName,
      accountNumber: "1234567890",
    },
    {
      id: "demo-mandiri",
      kind: "bank",
      bankName: "Mandiri",
      accountName: partnerBName,
      accountNumber: "0987654321",
    },
    {
      id: "demo-address",
      kind: "address",
      recipient: "Wedding gift",
      address: venueAddress || "Gift delivery address will appear here once set by the couple.",
    },
  ];

  return {
    templateId: template.id,
    locale: "id",
    partners: {
      a: { ...emptyPartner, nickname: partnerAName, displayName: partnerAName },
      b: { ...emptyPartner, nickname: partnerBName, displayName: partnerBName },
    },
    partnerAName,
    partnerBName,
    weddingDateLabel: template.date,
    ...(weddingDateIso ? { weddingDateIso } : {}),
    venueName,
    venueAddress,
    story: "A quiet celebration of two people choosing each other — every day, on purpose.",
    photoUrls: [1, 2, 3, 4, 5, 6].map((n) => `/demo/gallery-${n}.svg`),
    quote:
      "And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy.",
    quoteSource: "Qur’an · Ar-Rum 30:21",
    greeting: `With gratitude, ${partnerAName} & ${partnerBName} invite you to witness and celebrate their wedding day.`,
    closing:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.",
    events: [
      demoEvent("demo-akad", "akad", "Akad", "09:00"),
      demoEvent("demo-resepsi", "resepsi", "Resepsi", "12:00"),
    ],
    gifts,
    music: { url: "/demo/music.mp3", startSeconds: 0 },
    ...(guestName ? { guestName } : {}),
  };
}
