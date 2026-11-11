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

export function Opening({ data }: D) {
  const greeting = data.greeting.trim();
  const quote = data.quote.trim();
  if (!greeting && !quote) return null;
  return (
    <Section className="pt-16">
      <p className={T.label}>{templateLabel(data.locale, "openingKicker")}</p>
      {greeting && <p className="mt-6 text-[17px] leading-[1.75]">{greeting}</p>}
      {quote && (
        <figure className={cn(T.rule, "mt-12 border-y py-10")}>
          <blockquote className="text-[22px] font-light leading-[1.5]">{quote}</blockquote>
          {data.quoteSource.trim() && (
            <figcaption className={cn(T.label, "mt-6")}>{data.quoteSource}</figcaption>
          )}
        </figure>
      )}
    </Section>
  );
}

function Person({ partner, locale }: { partner: ViewPartner; locale: Locale }) {
  const parents = parentsLine(locale, partner);
  const full = partner.fullName.trim();
  return (
    <div className="min-w-0">
      <div className="aspect-square w-full overflow-hidden bg-[#e7e3dc]">
        {partner.photoUrl ? (
          <img
            src={partner.photoUrl}
            alt={partner.displayName}
            className="h-full w-full object-cover [filter:grayscale(1)]"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full items-center justify-center text-[56px] font-light text-[#111111]/70"
          >
            {partner.displayName.trim().slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <h3 className="mt-5 text-[19px] font-semibold uppercase leading-tight tracking-[0.14em] [overflow-wrap:anywhere]">
        {partner.displayName}
      </h3>
      {full && full !== partner.displayName && (
        <p className="mt-2 text-[15px] leading-snug [overflow-wrap:anywhere]">{full}</p>
      )}
      {parents && <p className={cn(T.muted, "mt-2 text-[15px] leading-snug")}>{parents}</p>}
    </div>
  );
}

export function Couple({ data }: D) {
  return (
    <Section>
      <SectionTitle
        kicker={templateLabel(data.locale, "coupleKicker")}
        title={templateLabel(data.locale, "coupleTitle")}
      />
      <div className="grid grid-cols-2 gap-4">
        <Person partner={data.partners.a} locale={data.locale} />
        <Person partner={data.partners.b} locale={data.locale} />
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
      <p className={T.label}>{templateLabel(data.locale, "countdownKicker")}</p>
      <div className={cn(T.rule, "mt-8 grid grid-cols-4 divide-x border-y", "divide-[#111111]/15")}>
        {cells.map(([value, key]) => (
          <div key={key} className="py-6 text-center">
            <p className="text-[30px] font-light leading-none tabular-nums">
              {value === undefined ? "--" : String(value).padStart(2, "0")}
            </p>
            <p className={cn(T.muted, "mt-3 text-[11px] uppercase tracking-[0.2em]")}>
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
    <Section>
      <SectionTitle
        kicker={templateLabel(data.locale, "eventsKicker")}
        title={templateLabel(data.locale, "eventsTitle")}
      />
      <ol className={cn(T.rule, "divide-y border-y", "divide-[#111111]/15")}>
        {data.events.map((event, i) => (
          <li key={event.id} className="py-10">
            <p className={T.label}>{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-3 text-[26px] font-light leading-tight">{event.title}</h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                {event.dateLabel && <p className="text-[16px] font-semibold">{event.dateLabel}</p>}
                {event.timeLabel && (
                  <p className={cn(T.muted, "mt-1 text-[16px]")}>{event.timeLabel}</p>
                )}
              </div>
              <div>
                {event.venueName && <p className="text-[16px] font-semibold">{event.venueName}</p>}
                {event.venueAddress && (
                  <p className={cn(T.muted, "mt-1 text-[15px] leading-snug")}>
                    {event.venueAddress}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {event.mapsUrl && (
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={T.ghost}
                >
                  {templateLabel(data.locale, "maps")}
                </a>
              )}
              <AddToCalendar event={event} names={names} className={T.ghost}>
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
        kicker={templateLabel(data.locale, "storyKicker")}
        title={templateLabel(data.locale, "storyTitle")}
      />
      <p className="text-[17px] leading-[1.75] whitespace-pre-line">{data.story}</p>
    </Section>
  );
}

export function Gallery({ data }: D) {
  const [index, setIndex] = useState<number | null>(null);
  if (data.photoUrls.length === 0) return null;
  return (
    <Section>
      <SectionTitle
        kicker={templateLabel(data.locale, "galleryKicker")}
        title={templateLabel(data.locale, "galleryTitle")}
      />
      <div className="grid grid-cols-2 gap-2">
        {data.photoUrls.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            data-testid="gallery-photo"
            aria-label={photoLabel(data.locale, i, data.photoUrls.length)}
            onClick={() => setIndex(i)}
            className="block aspect-square overflow-hidden bg-[#e7e3dc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>
      <Lightbox
        photos={data.photoUrls}
        index={index}
        onClose={() => setIndex(null)}
        onIndex={setIndex}
        locale={data.locale}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-[#fafaf7]/97 p-4"
        imageClassName="max-h-[85vh] max-w-full border-[10px] border-white object-contain shadow-[0_20px_50px_-30px_rgba(0,0,0,0.5)]"
        buttonClassName="grid h-11 w-11 place-items-center border border-[#111111] bg-[#fafaf7] text-2xl font-light text-[#111111] absolute"
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
        kicker={templateLabel(data.locale, "giftKicker")}
        title={templateLabel(data.locale, "giftTitle")}
      />
      <div className="flex flex-col gap-3">
        {data.gifts.map((gift) => (
          <div
            key={gift.id}
            className="flex flex-col gap-4 border border-[#111111]/20 bg-white px-5 py-6 sm:flex-row sm:items-center sm:justify-between"
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
                  className={cn(T.ghost, "shrink-0 self-start sm:self-auto")}
                />
              </>
            ) : (
              <>
                <div className="min-w-0">
                  <p className={T.label}>
                    {gift.kind === "bank" ? gift.bankName : gift.provider.toUpperCase()}
                  </p>
                  <p className="mt-2 text-[22px] font-light tracking-[0.08em] tabular-nums [overflow-wrap:anywhere]">
                    {gift.accountNumber}
                  </p>
                  <p className={cn(T.muted, "text-[15px]")}>{gift.accountName}</p>
                </div>
                <CopyButton
                  value={gift.accountNumber}
                  locale={data.locale}
                  className={cn(T.ghost, "shrink-0 self-start sm:self-auto")}
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
  "w-full border border-[#111111]/25 bg-white px-4 text-[16px] text-[#111111] outline-none placeholder:text-[#666666] focus:border-[#111111] focus:ring-1 focus:ring-[#111111]";

export function Rsvp({
  data,
  onSubmit,
  guestName,
}: D & { onSubmit?: RsvpHandler; guestName?: string }) {
  const t = (k: Parameters<typeof templateLabel>[1]) => templateLabel(data.locale, k);
  const box = "border border-[#111111]/20 bg-white px-6 py-8";
  return (
    <Section>
      <SectionTitle kicker={t("rsvpKicker")} title={t("rsvpTitle")} />
      <RsvpForm
        locale={data.locale}
        {...(onSubmit ? { onSubmit } : {})}
        {...(guestName ? { initialGuestName: guestName } : {})}
      >
        {(api) =>
          !api.enabled ? (
            <p className={cn(box, T.muted, "text-[16px]")}>{t("rsvpDisabled")}</p>
          ) : api.done ? (
            <p className={cn(box, "text-[17px]")}>{t("rsvpThanks")}</p>
          ) : (
            <form onSubmit={(e) => void api.submit(e)} className="space-y-3">
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
                      "min-h-12 border text-[12px] font-semibold uppercase tracking-[0.18em] transition",
                      api.status === value
                        ? "border-[#111111] bg-[#111111] text-[#fafaf7]"
                        : "border-[#111111]/25 bg-white text-[#111111]",
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
              {api.error && <p className="text-[15px] text-[#b42318]">{api.error}</p>}
              <button type="submit" disabled={api.busy} className={cn(T.button, "w-full")}>
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
    <Section className="pb-12 text-center">
      <p className={T.label}>{templateLabel(data.locale, "closingKicker")}</p>
      {closing && <p className="mx-auto mt-6 text-[17px] leading-[1.75]">{closing}</p>}
      <div className="mx-auto mt-10 h-px w-12 bg-[#111111]" />
      <p className="mt-8 text-[22px] font-light uppercase leading-snug tracking-[0.2em] [overflow-wrap:anywhere]">
        {data.partnerAName}
        <span className="mx-2">·</span>
        {data.partnerBName}
      </p>
    </Section>
  );
}
