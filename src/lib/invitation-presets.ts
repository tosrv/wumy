import {
  newId,
  type ContentEvent,
  type InvitationContent,
  type Locale,
  type Religion,
} from "./invitation-content";

export type Preset = {
  events: Pick<ContentEvent, "kind" | "title">[];
  quote: string;
  quoteSource: string;
  greeting: string;
  closing: string;
};

type Texts = Pick<Preset, "quote" | "quoteSource" | "greeting" | "closing">;

const GREETING: Record<Locale, string> = {
  id: "Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari bahagia kami.",
  en: "With the blessing of God Almighty, we joyfully invite you to celebrate our special day and share your prayers and good wishes with us.",
};

const CLOSING: Record<Locale, string> = {
  id: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Terima kasih atas perhatian dan kehadirannya.",
  en: "It would be an honour and a joy to have you with us. Thank you for your presence, love and prayers.",
};

const make = (events: Preset["events"], texts: Texts | null, locale: Locale): Preset => ({
  events,
  quote: texts?.quote ?? "",
  quoteSource: texts?.quoteSource ?? "",
  greeting: GREETING[locale],
  closing: CLOSING[locale],
});

const reception = (locale: Locale): Preset["events"][number] => ({
  kind: "resepsi",
  title: locale === "id" ? "Resepsi" : "Reception",
});

const QUOTES: Record<
  Exclude<Religion, "umum">,
  Record<Locale, Texts & { eventTitle: string; kind: ContentEvent["kind"] }>
> = {
  islam: {
    id: {
      kind: "akad",
      eventTitle: "Akad Nikah",
      quote:
        "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.",
      quoteSource: "QS. Ar-Rum 30:21",
      greeting: GREETING.id,
      closing: CLOSING.id,
    },
    en: {
      kind: "akad",
      eventTitle: "Akad Nikah",
      quote:
        "And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.",
      quoteSource: "Qur'an, Ar-Rum 30:21",
      greeting: GREETING.en,
      closing: CLOSING.en,
    },
  },
  kristen: {
    id: {
      kind: "pemberkatan",
      eventTitle: "Pemberkatan",
      quote:
        "Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya, sehingga keduanya menjadi satu daging.",
      quoteSource: "Kejadian 2:24",
      greeting: GREETING.id,
      closing: CLOSING.id,
    },
    en: {
      kind: "pemberkatan",
      eventTitle: "Holy Matrimony",
      quote:
        "Therefore a man shall leave his father and his mother and hold fast to his wife, and they shall become one flesh.",
      quoteSource: "Genesis 2:24",
      greeting: GREETING.en,
      closing: CLOSING.en,
    },
  },
  katolik: {
    id: {
      kind: "pemberkatan",
      eventTitle: "Sakramen Pernikahan",
      quote: "Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
      quoteSource: "Markus 10:9",
      greeting: GREETING.id,
      closing: CLOSING.id,
    },
    en: {
      kind: "pemberkatan",
      eventTitle: "Sacrament of Marriage",
      quote: "What therefore God has joined together, let not man separate.",
      quoteSource: "Mark 10:9",
      greeting: GREETING.en,
      closing: CLOSING.en,
    },
  },
  hindu: {
    id: {
      kind: "other",
      eventTitle: "Upacara Pawiwahan",
      quote:
        "Aku menggenggam tanganmu demi kebahagiaan, agar engkau mencapai usia lanjut bersamaku, suamimu. Para dewa Bhaga, Aryaman, Savitar dan Purandhi telah menganugerahkanmu kepadaku untuk membina rumah tangga.",
      quoteSource: "Rig Veda X.85.36 (disarikan)",
      greeting: GREETING.id,
      closing: CLOSING.id,
    },
    en: {
      kind: "other",
      eventTitle: "Pawiwahan Ceremony",
      quote:
        "I take your hand in mine for happiness, that you may live to old age with me, your husband. The gods Bhaga, Aryaman, Savitar and Purandhi have given you to me to keep our household.",
      quoteSource: "Rig Veda X.85.36 (paraphrased)",
      greeting: GREETING.en,
      closing: CLOSING.en,
    },
  },
  buddha: {
    id: {
      kind: "other",
      eventTitle: "Pemberkatan",
      quote:
        "Suami hendaknya menghormati istrinya, tidak merendahkannya, setia kepadanya, dan memercayakan urusan rumah tangga kepadanya; istri hendaknya mengatur rumah tangga dengan baik, ramah kepada sanak keluarga, setia, dan rajin dalam segala tugasnya.",
      quoteSource: "Sigalovada Sutta (disarikan)",
      greeting: GREETING.id,
      closing: CLOSING.id,
    },
    en: {
      kind: "other",
      eventTitle: "Blessing Ceremony",
      quote:
        "A husband should honour his wife, not despise her, be faithful to her, and entrust her with the running of the household; a wife should manage the home well, be hospitable to relatives, be faithful, and diligent in all her duties.",
      quoteSource: "Sigalovada Sutta (paraphrased)",
      greeting: GREETING.en,
      closing: CLOSING.en,
    },
  },
};

const LOCALES: Locale[] = ["id", "en"];

function build(religion: Religion, locale: Locale): Preset {
  if (religion === "umum") return make([reception(locale)], null, locale);
  const q = QUOTES[religion][locale];
  return make([{ kind: q.kind, title: q.eventTitle }, reception(locale)], q, locale);
}

const PRESETS = Object.fromEntries(
  (["islam", "kristen", "katolik", "hindu", "buddha", "umum"] as Religion[]).map((r) => [
    r,
    Object.fromEntries(LOCALES.map((l) => [l, build(r, l)])) as Record<Locale, Preset>,
  ]),
) as Record<Religion, Record<Locale, Preset>>;

export function getPreset(religion: Religion, locale: Locale): Preset {
  return PRESETS[religion][locale];
}

/** Fills empty texts (or overwrites them) and adds preset events only when there are none. */
export function applyPreset(
  c: InvitationContent,
  p: Preset,
  opts: { overwriteTexts?: boolean } = {},
): InvitationContent {
  const pick = (cur: string, next: string) => (opts.overwriteTexts || cur === "" ? next : cur);
  return {
    ...c,
    events:
      c.events.length === 0
        ? p.events.map((e) => ({
            id: newId(),
            kind: e.kind,
            title: e.title,
            date: "",
            startTime: "",
            endTime: "",
            venueName: "",
            venueAddress: "",
            mapsUrl: "",
          }))
        : c.events,
    quote: pick(c.quote, p.quote),
    quoteSource: pick(c.quoteSource, p.quoteSource),
    greeting: pick(c.greeting, p.greeting),
    closing: pick(c.closing, p.closing),
  };
}

/** True if quote/quoteSource/greeting/closing is non-empty and differs from the current religion's preset. */
export function textsDifferFromPreset(c: InvitationContent): boolean {
  const p = getPreset(c.religion, c.locale);
  const differs = (cur: string, preset: string) => cur !== "" && cur !== preset;
  return (
    differs(c.quote, p.quote) ||
    differs(c.quoteSource, p.quoteSource) ||
    differs(c.greeting, p.greeting) ||
    differs(c.closing, p.closing)
  );
}
