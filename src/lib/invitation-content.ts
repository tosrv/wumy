import { z } from "zod";

export const MAX_ITEMS = 6;

export const localeSchema = z.enum(["id", "en"]);
export const religionSchema = z.enum(["islam", "kristen", "katolik", "hindu", "buddha", "umum"]);
export const photoRoleSchema = z.enum(["gallery", "partner_a", "partner_b", "cover"]);
export const eventKindSchema = z.enum(["akad", "pemberkatan", "resepsi", "ngunduh_mantu", "other"]);
export const ewalletProviderSchema = z.enum(["dana", "ovo", "gopay", "shopeepay", "other"]);

export type Locale = z.infer<typeof localeSchema>;
export type Religion = z.infer<typeof religionSchema>;
export type PhotoRole = z.infer<typeof photoRoleSchema>;

export type Partner = {
  fullName: string;
  nickname: string;
  fatherName: string;
  motherName: string;
  childOrder: string;
};

export type ContentEvent = {
  id: string;
  kind: z.infer<typeof eventKindSchema>;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  startTime: string;
  /** HH:mm, "" = "selesai" */
  endTime: string;
  venueName: string;
  venueAddress: string;
  /** "" or https URL */
  mapsUrl: string;
};

export type Gift =
  | { id: string; kind: "bank"; bankName: string; accountName: string; accountNumber: string }
  | {
      id: string;
      kind: "ewallet";
      provider: z.infer<typeof ewalletProviderSchema>;
      accountName: string;
      accountNumber: string;
    }
  | { id: string; kind: "address"; recipient: string; address: string };

export type ContentMusic = {
  /** Storage path in the invitation-music bucket */
  path: string;
  /** Integer seconds, 0..MAX_MUSIC_START_SECONDS */
  startSeconds: number;
  fileName: string;
};

export type InvitationContent = {
  version: 1;
  locale: Locale;
  religion: Religion;
  partners: { a: Partner; b: Partner };
  events: ContentEvent[];
  gifts: Gift[];
  quote: string;
  quoteSource: string;
  greeting: string;
  closing: string;
  music?: ContentMusic | undefined;
};

export function newId(): string {
  return crypto.randomUUID();
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const isHttpsUrl = (v: string) => {
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
};

const str = z.string();
const lenientStr = z.string().catch("");
const idField = z
  .string()
  .min(1)
  .catch(() => newId());

/* ---------- Draft (lenient) ---------- */

const draftPartner = z.object({
  fullName: lenientStr,
  nickname: lenientStr,
  fatherName: lenientStr,
  motherName: lenientStr,
  childOrder: lenientStr,
});

const draftEvent = z.object({
  id: idField,
  kind: eventKindSchema.catch("other"),
  title: lenientStr,
  date: str.regex(DATE_RE).catch(""),
  startTime: str.regex(TIME_RE).catch(""),
  endTime: z.union([z.literal(""), str.regex(TIME_RE)]).catch(""),
  venueName: lenientStr,
  venueAddress: lenientStr,
  mapsUrl: z.union([z.literal(""), str.refine(isHttpsUrl)]).catch(""),
});

const draftGift = z.discriminatedUnion("kind", [
  z.object({
    id: idField,
    kind: z.literal("bank"),
    bankName: lenientStr,
    accountName: lenientStr,
    accountNumber: lenientStr,
  }),
  z.object({
    id: idField,
    kind: z.literal("ewallet"),
    provider: ewalletProviderSchema.catch("other"),
    accountName: lenientStr,
    accountNumber: lenientStr,
  }),
  z.object({
    id: idField,
    kind: z.literal("address"),
    recipient: lenientStr,
    address: lenientStr,
  }),
]);

/** Parse each item independently; drop the ones that cannot be salvaged; cap at MAX_ITEMS. */
function lenientList<T>(item: z.ZodType<T, unknown>) {
  return z
    .array(z.unknown())
    .catch([])
    .transform((arr) =>
      arr
        .flatMap((x) => {
          const r = item.safeParse(x);
          return r.success ? [r.data] : [];
        })
        .slice(0, MAX_ITEMS),
    );
}

/** Shape built by uploadInvitationMusic: {owner}/{invitation}/music-{ms}.mp3 */
const MUSIC_PATH_RE = /^[^/]+\/[^/]+\/music-\d+\.mp3$/;

export const MAX_MUSIC_START_SECONDS = 600;

const draftMusic = z.object({
  path: z.string().regex(MUSIC_PATH_RE),
  startSeconds: z
    .number()
    .finite()
    .transform((n) => Math.min(MAX_MUSIC_START_SECONDS, Math.max(0, Math.floor(n))))
    .catch(0),
  fileName: lenientStr,
});

/** Invalid music is dropped (undefined), never an error. */
const lenientMusic = z.unknown().transform((v) => {
  const r = draftMusic.safeParse(v);
  return r.success ? r.data : undefined;
});

const draftObject = z.object({
  version: z.literal(1).catch(1),
  locale: localeSchema.catch("id"),
  religion: religionSchema.catch("umum"),
  partners: z
    .object({
      a: draftPartner.catch(() => draftPartner.parse({})),
      b: draftPartner.catch(() => draftPartner.parse({})),
    })
    .catch(() => ({ a: draftPartner.parse({}), b: draftPartner.parse({}) })),
  events: lenientList(draftEvent),
  gifts: lenientList(draftGift),
  quote: lenientStr,
  quoteSource: lenientStr,
  greeting: lenientStr,
  closing: lenientStr,
  music: lenientMusic.optional(),
});

export const contentDraftSchema: z.ZodType<InvitationContent, unknown> = z
  .unknown()
  .transform((v) => (v !== null && typeof v === "object" && !Array.isArray(v) ? v : {}))
  .pipe(draftObject)
  .transform(({ music, ...rest }) => (music ? { ...rest, music } : rest));

/* ---------- Publish (strict) ---------- */

const req = z.string().trim().min(1);

const publishPartner = z
  .object({
    fullName: str,
    nickname: str,
    fatherName: str,
    motherName: str,
    childOrder: str,
  })
  .refine((p) => p.nickname.trim() !== "" || p.fullName.trim() !== "", {
    message: "Nickname or full name is required",
    path: ["nickname"],
  });

const publishEvent = z.object({
  id: z.string().min(1),
  kind: eventKindSchema,
  title: str,
  date: str.regex(DATE_RE),
  startTime: str.regex(TIME_RE),
  endTime: z.union([z.literal(""), str.regex(TIME_RE)]),
  venueName: req,
  venueAddress: str,
  mapsUrl: z.union([z.literal(""), str.refine(isHttpsUrl, "Must be an https URL")]),
});

const publishGift = z.discriminatedUnion("kind", [
  z.object({
    id: z.string().min(1),
    kind: z.literal("bank"),
    bankName: req,
    accountName: req,
    accountNumber: req,
  }),
  z.object({
    id: z.string().min(1),
    kind: z.literal("ewallet"),
    provider: ewalletProviderSchema,
    accountName: req,
    accountNumber: req,
  }),
  z.object({
    id: z.string().min(1),
    kind: z.literal("address"),
    recipient: req,
    address: req,
  }),
]);

export const contentPublishSchema: z.ZodType<InvitationContent, unknown> = z.object({
  version: z.literal(1),
  locale: localeSchema,
  religion: religionSchema,
  partners: z.object({ a: publishPartner, b: publishPartner }),
  events: z.array(publishEvent).min(1).max(MAX_ITEMS),
  gifts: z.array(publishGift).max(MAX_ITEMS),
  quote: str,
  quoteSource: str,
  greeting: str,
  closing: str,
  music: draftMusic.optional(),
});

/* ---------- Helpers ---------- */

const emptyPartner = (): Partner => ({
  fullName: "",
  nickname: "",
  fatherName: "",
  motherName: "",
  childOrder: "",
});

export function emptyContent(): InvitationContent {
  return {
    version: 1,
    locale: "id",
    religion: "umum",
    partners: { a: emptyPartner(), b: emptyPartner() },
    events: [],
    gifts: [],
    quote: "",
    quoteSource: "",
    greeting: "",
    closing: "",
  };
}
