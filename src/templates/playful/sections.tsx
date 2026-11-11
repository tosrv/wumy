import { useState } from "react";
import type { InvitationViewModel, ViewPartner } from "@/components/invitations/types";
import type { Locale } from "@/lib/invitation-content";
import { cn } from "@/lib/utils";
import {
  AddToCalendar,
  CopyButton,
  Lightbox,
  RsvpForm,
  useCountdown,
  type RsvpHandler,
} from "@/templates/shared";
import { parentsLine, photoLabel, templateLabel } from "../labels";
import { Section, SectionTitle, T } from "./parts";

type D = { data: InvitationViewModel };
type Key = Parameters<typeof templateLabel>[1];

export function Opening({ data }: D) {
  const greeting = data.greeting.trim();
  const quote = data.quote.trim();
  if (!greeting && !quote) return null;
  return (
    <Section className="pt-20">
      <SectionTitle
        index={1}
        kicker={templateLabel(data.locale, "openingKicker")}
        title={templateLabel(data.locale, "theWeddingOf")}
      />
      {greeting && <p className="text-[17px] leading-[1.7]">{greeting}</p>}
      {quote && (
        <figure className={cn(T.card, "mt-10 px-6 py-7")}>
          <blockquote className={cn(T.display, "text-[22px] font-bold leading-[1.35]")}>
            “{quote}”
          </blockquote>
          {data.quoteSource.trim() && (
            <figcaption className={cn(T.label, "mt-5")}>{data.quoteSource}</figcaption>
          )}
        </figure>
      )}
    </Section>
  );
}

function Person({ partner, locale, tilt }: { partner: ViewPartner; locale: Locale; tilt: 1 | 2 }) {
  const parents = parentsLine(locale, partner);
  const full = partner.fullName.trim();
  return (
    <div className="min-w-0">
      <div className={cn(T.card, "relative aspect-[4/5] w-full overflow-hidden")}>
        {partner.photoUrl ? (
          <img
            src={partner.photoUrl}
            alt={partner.displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              T.display,
              tilt === 1 ? T.pink : T.cream,
              "flex h-full items-center justify-center text-[72px] font-extrabold",
            )}
          >
            {partner.displayName.trim().slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <h3
        className={cn(
          T.sticker,
          T.display,
          tilt === 1 ? cn(T.pink, "-rotate-3") : cn(T.lime, "rotate-3"),
          "relative -mt-5 ml-3 max-w-[calc(100%-12px)] px-4 py-1.5 text-[16px] font-extrabold tracking-normal sm:text-[18px] normal-case [overflow-wrap:anywhere]",
        )}
      >
        {partner.displayName}
      </h3>
      {full && full !== partner.displayName && (
        <p className="mt-3 text-[15px] font-semibold leading-snug [overflow-wrap:anywhere]">
          {full}
        </p>
      )}
      {parents && <p className={cn(T.muted, "mt-1 text-[15px] leading-snug")}>{parents}</p>}
    </div>
  );
}

export function Couple({ data }: D) {
  return (
    <Section band>
      <SectionTitle
        index={2}
        kicker={templateLabel(data.locale, "coupleKicker")}
        title={templateLabel(data.locale, "coupleTitle")}
      />
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <Person partner={data.partners.a} locale={data.locale} tilt={1} />
        <Person partner={data.partners.b} locale={data.locale} tilt={2} />
      </div>
    </Section>
  );
}

export function Countdown({ data }: D) {
  const parts = useCountdown(data.weddingDateIso);
  if (!data.weddingDateIso) return null;
  const cells = [
    [parts?.days, "countdownDays"],
    [parts?.hours, "countdownHours"],
    [parts?.minutes, "countdownMinutes"],
    [parts?.seconds, "countdownSeconds"],
  ] as const;
  return (
    <Section>
      <SectionTitle
        index={3}
        kicker={templateLabel(data.locale, "countdownKicker")}
        title={data.events[0]?.dateLabel || templateLabel(data.locale, "eventsTitle")}
      />
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
        {cells.map(([value, key], i) => (
          <div
            key={key}
            className={cn(
              "rounded-[18px] border-2 border-[#1b1b1b] px-1 py-4 text-center shadow-[4px_4px_0_#1b1b1b]",
              i % 2 === 0 ? "bg-white" : T.pink,
            )}
          >
            <p
              className={cn(
                T.display,
                "text-[clamp(26px,8vw,42px)] font-extrabold leading-none tabular-nums",
              )}
            >
              {value === undefined ? "--" : String(value).padStart(2, "0")}
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
              {templateLabel(data.locale, key)}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Events({ data }: D) {
  if (data.events.length === 0) return null;
  const names = `${data.partnerAName} & ${data.partnerBName}`;
  return (
    <Section band>
      <SectionTitle
        index={4}
        kicker={templateLabel(data.locale, "eventsKicker")}
        title={templateLabel(data.locale, "eventsTitle")}
      />
      <ol className="space-y-6">
        {data.events.map((event, i) => (
          <li key={event.id} className={cn(T.card, i % 2 === 0 ? T.lime : T.pink, "px-6 py-7")}>
            <p className={cn(T.sticker, "bg-white", i % 2 === 0 ? "rotate-2" : "-rotate-2")}>
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3
              className={cn(
                T.display,
                "mt-4 text-[28px] font-extrabold leading-[1.05] [overflow-wrap:anywhere]",
              )}
            >
              {event.title}
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
              <div className="min-w-0">
                {event.dateLabel && <p className="text-[16px] font-semibold">{event.dateLabel}</p>}
                {event.timeLabel && (
                  <p className="mt-1 text-[16px] tabular-nums">{event.timeLabel}</p>
                )}
              </div>
              <div className="min-w-0">
                {event.venueName && <p className="text-[16px] font-semibold">{event.venueName}</p>}
                {event.venueAddress && (
                  <p className="mt-1 text-[15px] leading-snug">{event.venueAddress}</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {event.mapsUrl && (
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(T.ghost, T.press)}
                >
                  {templateLabel(data.locale, "maps")}
                </a>
              )}
              <AddToCalendar event={event} names={names} className={cn(T.ghost, T.press)}>
                {templateLabel(data.locale, "addToCalendar")}
              </AddToCalendar>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Story({ data }: D) {
  if (!data.story.trim()) return null;
  return (
    <Section>
      <SectionTitle
        index={5}
        kicker={templateLabel(data.locale, "storyKicker")}
        title={templateLabel(data.locale, "storyTitle")}
      />
      <div className={cn(T.card, "px-6 py-7")}>
        <p className="text-[17px] leading-[1.7] whitespace-pre-line">{data.story}</p>
      </div>
    </Section>
  );
}

export function Gallery({ data }: D) {
  const [index, setIndex] = useState<number | null>(null);
  if (data.photoUrls.length === 0) return null;
  return (
    <Section band>
      <SectionTitle
        index={6}
        kicker={templateLabel(data.locale, "galleryKicker")}
        title={templateLabel(data.locale, "galleryTitle")}
      />
      <div className="overflow-x-clip py-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-1 sm:grid-cols-3 sm:gap-6">
          {data.photoUrls.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              data-testid="gallery-photo"
              aria-label={photoLabel(data.locale, i, data.photoUrls.length)}
              onClick={() => setIndex(i)}
              className={cn(
                "block aspect-square overflow-hidden rounded-[16px] border-2 border-[#1b1b1b] bg-white shadow-[4px_4px_0_#1b1b1b] transition-transform duration-300 hover:rotate-0 motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#1b1b1b]",
                i % 2 === 0 ? "-rotate-2" : "rotate-2",
              )}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      <Lightbox
        photos={data.photoUrls}
        index={index}
        onClose={() => setIndex(null)}
        onIndex={setIndex}
        locale={data.locale}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1b1b1b]/95 p-4"
        imageClassName="max-h-[85vh] max-w-full rounded-[18px] border-2 border-white object-contain"
        buttonClassName="grid h-11 w-11 place-items-center rounded-full border-2 border-[#1b1b1b] bg-[#d4f932] text-2xl font-bold text-[#1b1b1b] absolute"
        closeButtonClassName="right-4 top-4"
        prevButtonClassName="left-3 top-1/2 -translate-y-1/2"
        nextButtonClassName="right-3 top-1/2 -translate-y-1/2"
      />
    </Section>
  );
}

export function Gifts({ data }: D) {
  if (data.gifts.length === 0) return null;
  return (
    <Section>
      <SectionTitle
        index={7}
        kicker={templateLabel(data.locale, "giftKicker")}
        title={templateLabel(data.locale, "giftTitle")}
      />
      <div className="flex flex-col gap-5">
        {data.gifts.map((gift) => (
          <div
            key={gift.id}
            className={cn(
              T.card,
              "flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between",
            )}
          >
            {gift.kind === "address" ? (
              <>
                <div className="min-w-0">
                  <p className={T.label}>{gift.recipient}</p>
                  <p className="mt-2 text-[16px] leading-relaxed">{gift.address}</p>
                </div>
                <CopyButton
                  value={gift.address}
                  locale={data.locale}
                  kind="address"
                  className={cn(T.ghost, T.press, "shrink-0 self-start sm:self-auto")}
                />
              </>
            ) : (
              <>
                <div className="min-w-0">
                  <p className={cn(T.sticker, T.pink, "-rotate-2")}>
                    {gift.kind === "bank" ? gift.bankName : gift.provider.toUpperCase()}
                  </p>
                  <p
                    className={cn(
                      T.display,
                      "mt-3 text-[24px] font-extrabold tracking-[0.02em] tabular-nums [overflow-wrap:anywhere]",
                    )}
                  >
                    {gift.accountNumber}
                  </p>
                  <p className={cn(T.muted, "text-[15px]")}>{gift.accountName}</p>
                </div>
                <CopyButton
                  value={gift.accountNumber}
                  locale={data.locale}
                  className={cn(T.ghost, T.press, "shrink-0 self-start sm:self-auto")}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

const field =
  "w-full rounded-[14px] border-2 border-[#1b1b1b] bg-white px-4 text-[16px] text-[#1b1b1b] outline-none placeholder:text-[#1b1b1b]/60 focus:shadow-[3px_3px_0_#1b1b1b]";

export function Rsvp({
  data,
  onSubmit,
  guestName,
}: D & { onSubmit?: RsvpHandler; guestName?: string }) {
  const t = (k: Key) => templateLabel(data.locale, k);
  const box = cn(T.card, "px-6 py-8");
  return (
    <Section band>
      <SectionTitle index={8} kicker={t("rsvpKicker")} title={t("rsvpTitle")} />
      <RsvpForm
        locale={data.locale}
        {...(onSubmit ? { onSubmit } : {})}
        {...(guestName ? { initialGuestName: guestName } : {})}
      >
        {(api) =>
          !api.enabled ? (
            <p className={cn(box, "text-[16px]")}>{t("rsvpDisabled")}</p>
          ) : api.done ? (
            <p className={cn(box, "text-[17px] font-semibold")}>{t("rsvpThanks")}</p>
          ) : (
            <form onSubmit={(e) => void api.submit(e)} className={cn(box, "space-y-3")}>
              <input
                required
                aria-label={t("rsvpName")}
                value={api.guestName}
                onChange={(e) => api.setGuestName(e.target.value)}
                placeholder={t("rsvpName")}
                className={cn(field, "h-12")}
              />
              <select
                aria-label={t("rsvpGuests")}
                value={api.partySize}
                onChange={(e) => api.setPartySize(Number(e.target.value))}
                className={cn(field, "h-12")}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {t("rsvpGuests")}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["coming", "rsvpComing"],
                    ["not_coming", "rsvpNotComing"],
                  ] as const
                ).map(([value, key]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={api.status === value}
                    onClick={() => api.setStatus(value)}
                    className={cn(
                      T.press,
                      "min-h-12 rounded-full border-2 border-[#1b1b1b] text-[14px] font-semibold text-[#1b1b1b] shadow-[3px_3px_0_#1b1b1b] active:shadow-[1px_1px_0_#1b1b1b]",
                      api.status === value ? (value === "coming" ? T.lime : T.pink) : "bg-white",
                    )}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
              <textarea
                aria-label={t("rsvpMessage")}
                value={api.message}
                onChange={(e) => api.setMessage(e.target.value)}
                rows={3}
                placeholder={t("rsvpMessage")}
                className={cn(field, "resize-none py-3")}
              />
              {api.error && <p className="text-[15px] font-semibold text-[#b3261e]">{api.error}</p>}
              <button type="submit" disabled={api.busy} className={cn(T.button, T.press, "w-full")}>
                {api.busy ? t("rsvpSending") : t("rsvpSubmit")}
              </button>
            </form>
          )
        }
      </RsvpForm>
    </Section>
  );
}

export function Closing({ data }: D) {
  const closing = data.closing.trim();
  return (
    <Section className="pb-20">
      <div className={cn(T.card, "relative px-6 pt-12 pb-10 text-center")}>
        <p className={cn(T.sticker, T.pink, "absolute -top-4 left-1/2 -translate-x-1/2 -rotate-3")}>
          {templateLabel(data.locale, "closingKicker")}
        </p>
        {closing && <p className="text-[17px] leading-[1.7]">{closing}</p>}
        <p
          className={cn(
            T.display,
            "mt-8 text-[clamp(34px,10vw,56px)] font-extrabold leading-[1.02] tracking-[-0.02em] [overflow-wrap:anywhere]",
          )}
        >
          {data.partnerAName}
          <span className="block text-[#ff8fb1] [-webkit-text-stroke:1.5px_#1b1b1b]">&amp;</span>
          {data.partnerBName}
        </p>
      </div>
    </Section>
  );
}
