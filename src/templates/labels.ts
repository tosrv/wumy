import type { Locale, Partner } from "@/lib/invitation-content";

/** Static section labels shared by the invitation templates. */
const LABELS = {
  id: {
    eventsKicker: "Detail Acara",
    eventsTitle: "Save the Date",
    giftKicker: "Amplop Digital",
    giftTitle: "Kado Tanda Kasih",
    rsvpKicker: "RSVP",
    rsvpTitle: "Konfirmasi Kehadiran",
    rsvpDisabled: "Form RSVP aktif setelah undangan dipublish.",
    countdownDays: "Hari",
    countdownHours: "Jam",
    countdownMinutes: "Menit",
    countdownSeconds: "Detik",
    maps: "Google Maps",
    copyNumber: "Salin nomor",
    copyAddress: "Salin alamat",
    copiedNumber: "Nomor disalin",
    copiedAddress: "Alamat disalin",
    copyFailed: "Gagal menyalin",
    openInvitation: "Buka Undangan",
    addToCalendar: "Simpan ke Kalender",
    close: "Tutup",
    previous: "Sebelumnya",
    next: "Berikutnya",
    to: "Kepada Yth.",
    openingKicker: "Bismillah",
    coupleKicker: "Mempelai",
    coupleTitle: "Kami Berdua",
    countdownKicker: "Menuju Hari Bahagia",
    storyKicker: "Kisah Kami",
    storyTitle: "Cerita Cinta",
    galleryKicker: "Galeri",
    galleryTitle: "Momen Kami",
    closingKicker: "Terima Kasih",
    saveTheDate: "Save the Date",
    guestFallback: "Tamu Undangan",
    rsvpName: "Nama lengkap",
    rsvpGuests: "orang",
    rsvpComing: "Hadir",
    rsvpNotComing: "Tidak hadir",
    rsvpMessage: "Ucapan & doa (opsional)",
    rsvpSubmit: "Kirim Konfirmasi",
    rsvpSending: "Mengirim…",
    rsvpThanks: "Terima kasih — konfirmasi Anda sudah kami terima.",
    theWeddingOf: "Pernikahan",
    theWeddingIssue: "Edisi Pernikahan",
    and: "dan",
    photoOf: "Foto {n} dari {total}",
    galleryRegion: "Galeri foto",
    rsvpPickStatus: "Pilih kehadiran Anda.",
    rsvpFailed: "Gagal mengirim RSVP.",
    playMusic: "Putar musik",
    pauseMusic: "Jeda musik",
  },
  en: {
    eventsKicker: "Event Details",
    eventsTitle: "Save the Date",
    giftKicker: "Digital Gift",
    giftTitle: "With Love",
    rsvpKicker: "RSVP",
    rsvpTitle: "Will you join?",
    rsvpDisabled: "The RSVP form goes live once the invitation is published.",
    countdownDays: "Days",
    countdownHours: "Hrs",
    countdownMinutes: "Min",
    countdownSeconds: "Sec",
    maps: "Google Maps",
    copyNumber: "Copy number",
    copyAddress: "Copy address",
    copiedNumber: "Number copied",
    copiedAddress: "Address copied",
    copyFailed: "Copy failed",
    openInvitation: "Open Invitation",
    addToCalendar: "Add to Calendar",
    close: "Close",
    previous: "Previous",
    next: "Next",
    to: "Dear",
    openingKicker: "With Gratitude",
    coupleKicker: "The Couple",
    coupleTitle: "Together",
    countdownKicker: "Counting the Days",
    storyKicker: "Our Story",
    storyTitle: "Love Story",
    galleryKicker: "Gallery",
    galleryTitle: "Our Moments",
    closingKicker: "Thank You",
    saveTheDate: "Save the Date",
    guestFallback: "Our Honoured Guest",
    rsvpName: "Full name",
    rsvpGuests: "guest(s)",
    rsvpComing: "Attending",
    rsvpNotComing: "Not attending",
    rsvpMessage: "Wishes & prayers (optional)",
    rsvpSubmit: "Send RSVP",
    rsvpSending: "Sending…",
    rsvpThanks: "Thank you — we have received your RSVP.",
    theWeddingOf: "The Wedding of",
    theWeddingIssue: "The Wedding Issue",
    and: "and",
    photoOf: "Photo {n} of {total}",
    galleryRegion: "Photo gallery",
    rsvpPickStatus: "Please choose your attendance.",
    rsvpFailed: "Failed to send RSVP.",
    playMusic: "Play music",
    pauseMusic: "Pause music",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type TemplateLabelKey = keyof (typeof LABELS)["id"];

export const TEMPLATE_LABEL_KEYS = Object.keys(LABELS.id) as TemplateLabelKey[];

export function templateLabel(locale: Locale, key: TemplateLabelKey): string {
  return LABELS[locale][key];
}

/** "Foto {n} dari {total}" / "Photo {n} of {total}" for a 0-based index. */
export function photoLabel(locale: Locale, index: number, total: number): string {
  return LABELS[locale].photoOf.replace("{n}", String(index + 1)).replace("{total}", String(total));
}

/**
 * "Putra/Putri ke-{order} dari Bapak {father} & Ibu {mother}" (en: "Child of Mr. … & Mrs. …").
 * Returns null unless at least one parent name is filled.
 */
export function parentsLine(locale: Locale, partner: Partner): string | null {
  const father = partner.fatherName.trim();
  const mother = partner.motherName.trim();
  if (!father && !mother) return null;
  const order = partner.childOrder.trim();

  if (locale === "en") {
    const parents = [father && `Mr. ${father}`, mother && `Mrs. ${mother}`]
      .filter(Boolean)
      .join(" & ");
    return `${order ? `Child #${order}` : "Child"} of ${parents}`;
  }
  const parents = [father && `Bapak ${father}`, mother && `Ibu ${mother}`]
    .filter(Boolean)
    .join(" & ");
  return `Putra/Putri${order ? ` ke-${order}` : ""} dari ${parents}`;
}
