/** Share-preview (WhatsApp / Open Graph) text for a published invitation. Pure. */

export type SharePartner = { nickname: string; fullName: string };

export type ShareMetaInput = {
  partnerA: SharePartner;
  partnerB: SharePartner;
  /** Event dates as YYYY-MM-DD, in display order; blanks are skipped. */
  eventDates: string[];
  /** Absolute image URL (cover photo), if any. */
  image?: string | undefined;
  /** Guest name from a personalised ?to= link. */
  guestName?: string | undefined;
};

export type ShareMeta = { title: string; description: string; image?: string };

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatShareDate(iso: string): string {
  const m = DATE_RE.exec(iso.trim());
  if (!m) return "";
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (date.toISOString().slice(0, 10) !== iso.trim()) return "";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

const nameOf = (p: SharePartner) => p.nickname.trim() || p.fullName.trim();

export function buildShareMeta(input: ShareMetaInput): ShareMeta {
  const couple = [nameOf(input.partnerA), nameOf(input.partnerB)].filter(Boolean).join(" & ");
  const base = `${couple || "Kami"} — Undangan Pernikahan`;
  const guest = input.guestName?.trim();
  const title = guest ? `Kepada ${guest}: ${base}` : base;

  const date = input.eventDates.map(formatShareDate).find(Boolean);
  const description = date
    ? `${date} · Buka undangan kami`
    : "Kami mengundang Anda. Buka undangan kami.";

  return { title, description, ...(input.image ? { image: input.image } : {}) };
}

/** Storage path of the photo to use in the preview: cover first, then the first gallery photo. */
export function pickShareImage(
  photos: readonly { storage_path: string; role: string }[],
): string | undefined {
  return (
    photos.find((p) => p.role === "cover")?.storage_path ??
    photos.find((p) => p.role === "gallery")?.storage_path
  );
}
