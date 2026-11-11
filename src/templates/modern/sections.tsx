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

type D = { data: InvitationViewModel; no: number };

export function Opening({ data, no }: D) {
  const greeting = data.greeting.trim();
  const quote = data.quote.trim();
  if (!greeting && !quote) return null;
  return (
    <Section className="border-t-0 pt-16">
      <SectionTitle index={no} title={templateLabel(data.locale, "openingKicker")} />
      {greeting && <p className="text-[17px] leading-[1.7]">{greeting}</p>}
      {quote && (
        <figure className="mt-10 border-l-4 border-[#d4f932] pl-5">
          <blockquote className="text-[22px] font-semibold leading-[1.35] tracking-[-0.01em]">
            {quote}
          </blockquote>
          {data.quoteSource.trim() && (
            <figcaption className={cn(T.label, "mt-5")}>{data.quoteSource}</figcaption>
          )}
        </figure>
      )}
    </Section>
  );
}

function Person({ partner, locale, n }: { partner: ViewPartner; locale: Locale; n: string }) {
  const parents = parentsLine(locale, partner);
  const full = partner.fullName.trim();
  return (
    <div className="min-w-0">
      <div className="relative aspect-square w-full overflow-hidden bg-[#1a1a1a]">
        {partner.photoUrl ? (
          <img
            src={partner.photoUrl}
            alt={partner.displayName}
            className="h-full w-full object-cover contrast-125 grayscale"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full items-center justify-center text-[64px] font-bold text-[#f2f2f0]/80"
          >
            {partner.displayName.trim().slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <p
        aria-hidden
        className={cn(
          T.accent,
          "mt-4 text-[clamp(36px,11vw,48px)] font-bold leading-none tracking-[-0.04em]",
        )}
      >
        {n}
      </p>
      <h3 className="mt-2 text-[22px] font-bold uppercase leading-[1] tracking-[-0.02em] [overflow-wrap:anywhere]">
        {partner.displayName}
      </h3>
      {full && full !== partner.displayName && (
        <p className="mt-2 text-[15px] leading-snug [overflow-wrap:anywhere]">{full}</p>
      )}
      {parents && <p className={cn(T.muted, "mt-2 text-[15px] leading-snug")}>{parents}</p>}
    </div>
  );
}

export function Couple({ data, no }: D) {
  return (
    <Section>
      <SectionTitle index={no} title={templateLabel(data.locale, "coupleTitle")} />
      <div className="grid grid-cols-2 gap-4">
        <Person partner={data.partners.a} locale={data.locale} n="01" />
        <Person partner={data.partners.b} locale={data.locale} n="02" />
      </div>
    </Section>
  );
}

export function Countdown({ data, no }: D) {
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
      <SectionTitle index={no} title={templateLabel(data.locale, "countdownKicker")} />
      <div className="grid grid-cols-4 gap-2">
        {cells.map(([value, key]) => (
          <div key={key} className="border border-[#d4f932] px-1 py-5 text-center">
            <p className="text-[clamp(26px,8vw,40px)] font-bold leading-none tracking-[-0.02em] tabular-nums">
              {value === undefined ? "--" : String(value).padStart(2, "0")}
            </p>
            <p
              className={cn(T.muted, "mt-3 text-[11px] font-semibold uppercase tracking-[0.12em]")}
            >
              {templateLabel(data.locale, key)}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Events({ data, no }: D) {
  if (data.events.length === 0) return null;
  const names = `${data.partnerAName} & ${data.partnerBName}`;
  return (
    <Section>
      <SectionTitle index={no} title={templateLabel(data.locale, "eventsTitle")} />
      <ol className="space-y-4">
        {data.events.map((event, i) => (
          <li key={event.id} className={cn(T.rule, "border bg-[#121212]")}>
            <div className="flex items-baseline justify-between gap-4 px-5 pt-5">
              <p className={cn(T.accent, "text-[13px] font-semibold tracking-[0.2em]")}>
                No. {String(i + 1).padStart(2, "0")}
              </p>
            </div>
            <h3 className="px-5 pt-2 pb-5 text-[28px] font-bold uppercase leading-[1] tracking-[-0.02em] [overflow-wrap:anywhere]">
              {event.title}
            </h3>
            <div aria-hidden className="border-t border-dashed border-[#ffffff40]" />
            <div className="grid grid-cols-1 gap-5 px-5 py-5 min-[400px]:grid-cols-2">
              <div className="min-w-0">
                {event.dateLabel && <p className="text-[16px] font-semibold">{event.dateLabel}</p>}
                {event.timeLabel && (
                  <p className={cn(T.muted, "mt-1 text-[16px] tabular-nums")}>{event.timeLabel}</p>
                )}
              </div>
              <div className="min-w-0">
                {event.venueName && <p className="text-[16px] font-semibold">{event.venueName}</p>}
                {event.venueAddress && (
                  <p className={cn(T.muted, "mt-1 text-[15px] leading-snug")}>
                    {event.venueAddress}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 px-5 pb-5">
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

export function Story({ data, no }: D) {
  if (!data.story.trim()) return null;
  return (
    <Section>
      <SectionTitle index={no} title={templateLabel(data.locale, "storyTitle")} />
      <p className="text-[17px] leading-[1.7] whitespace-pre-line">{data.story}</p>
    </Section>
  );
}

export function Gallery({ data, no }: D) {
  const [index, setIndex] = useState<number | null>(null);
  if (data.photoUrls.length === 0) return null;
  return (
    <Section>
      <SectionTitle index={no} title={templateLabel(data.locale, "galleryTitle")} />
      <div className="-mx-5 grid grid-cols-2 min-[400px]:grid-cols-3 sm:mx-0">
        {data.photoUrls.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            data-testid="gallery-photo"
            aria-label={photoLabel(data.locale, i, data.photoUrls.length)}
            onClick={() => setIndex(i)}
            className="block aspect-square overflow-hidden bg-[#1a1a1a] focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#d4f932]"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover grayscale transition duration-500 motion-reduce:transition-none hover:grayscale-0"
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
        className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0c0c0c]/97 p-4"
        imageClassName="max-h-[85vh] max-w-full border border-[#ffffff20] object-contain"
        buttonClassName="grid h-11 w-11 place-items-center bg-[#d4f932] text-2xl font-bold text-[#0c0c0c] absolute"
        closeButtonClassName="right-4 top-4"
        prevButtonClassName="left-3 top-1/2 -translate-y-1/2"
        nextButtonClassName="right-3 top-1/2 -translate-y-1/2"
      />
    </Section>
  );
}

export function Gifts({ data, no }: D) {
  if (data.gifts.length === 0) return null;
  return (
    <Section>
      <SectionTitle index={no} title={templateLabel(data.locale, "giftTitle")} />
      <div className="flex flex-col gap-3">
        {data.gifts.map((gift) => (
          <div
            key={gift.id}
            className={cn(
              T.rule,
              "flex flex-col gap-4 border bg-[#121212] px-5 py-6 sm:flex-row sm:items-center sm:justify-between",
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
                  className={cn(T.ghost, "shrink-0 self-start sm:self-auto")}
                />
              </>
            ) : (
              <>
                <div className="min-w-0">
                  <p className={T.label}>
                    {gift.kind === "bank" ? gift.bankName : gift.provider.toUpperCase()}
                  </p>
                  <p className="mt-2 text-[24px] font-bold tracking-[0.04em] tabular-nums [overflow-wrap:anywhere]">
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
  "w-full border border-[#ffffff40] bg-[#121212] px-4 text-[16px] text-[#f2f2f0] outline-none placeholder:text-[#a3a3a0] focus:border-[#d4f932] focus:ring-1 focus:ring-[#d4f932]";

export function Rsvp({
  data,
  no,
  onSubmit,
  guestName,
}: D & { onSubmit?: RsvpHandler; guestName?: string }) {
  const t = (k: Parameters<typeof templateLabel>[1]) => templateLabel(data.locale, k);
  const box = cn(T.rule, "border bg-[#121212] px-6 py-8");
  return (
    <Section>
      <SectionTitle index={no} title={t("rsvpTitle")} />
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
                      "min-h-12 border text-[12px] font-semibold uppercase tracking-[0.14em] transition motion-reduce:transition-none",
                      api.status === value
                        ? "border-[#d4f932] bg-[#d4f932] text-[#0c0c0c]"
                        : "border-[#ffffff40] bg-[#121212] text-[#f2f2f0]",
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
              {api.error && <p className="text-[15px] text-[#ff8a80]">{api.error}</p>}
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

export function Closing({ data, no }: D) {
  const closing = data.closing.trim();
  return (
    <Section className="pb-14">
      <SectionTitle index={no} title={templateLabel(data.locale, "closingKicker")} />
      {closing && <p className="text-[17px] leading-[1.7]">{closing}</p>}
      <p className="mt-12 text-[clamp(36px,11vw,64px)] font-bold uppercase leading-[0.9] tracking-[-0.04em] [overflow-wrap:anywhere]">
        {data.partnerAName}
        <span className={cn(T.accent, "block")}>×</span>
        {data.partnerBName}
      </p>
    </Section>
  );
}
