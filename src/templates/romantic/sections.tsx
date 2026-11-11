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
import { FloralDivider, FloralRing } from "./ornaments";
import { R, Section, SectionTitle } from "./parts";

type D = { data: InvitationViewModel };

export function Opening({ data }: D) {
  const greeting = data.greeting.trim();
  const quote = data.quote.trim();
  if (!greeting && !quote) return null;
  return (
    <Section className="pt-20 text-center">
      <p className={cn(R.sans, R.kicker, "text-[11px] font-semibold uppercase tracking-[0.32em]")}>
        {templateLabel(data.locale, "openingKicker")}
      </p>
      <FloralDivider className="mx-auto mt-4 h-6 w-36" />
      {greeting && (
        <p className={cn(R.serif, "mx-auto mt-6 text-[19px] leading-relaxed")}>{greeting}</p>
      )}
      {quote && (
        <figure className={cn(R.card, "mt-10 px-7 py-9")}>
          <span className={cn(R.script, "block text-5xl leading-none text-[#c99a8f]")} aria-hidden>
            &ldquo;
          </span>
          <blockquote className={cn(R.serif, "text-[19px] italic leading-relaxed")}>
            {quote}
          </blockquote>
          {data.quoteSource.trim() && (
            <figcaption
              className={cn(R.sans, R.muted, "mt-5 text-[11px] uppercase tracking-[0.24em]")}
            >
              {data.quoteSource}
            </figcaption>
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
    <div className="flex flex-col items-center text-center">
      <div className="relative h-56 w-56">
        <FloralRing className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-[26px] overflow-hidden rounded-full bg-[#f0d5cd] shadow-[0_8px_24px_-14px_rgba(122,74,64,0.6)]">
          {partner.photoUrl ? (
            <img
              src={partner.photoUrl}
              alt={partner.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={cn(R.script, "flex h-full items-center justify-center text-[64px]")}>
              {partner.displayName.slice(0, 1)}
            </div>
          )}
        </div>
      </div>
      <h3 className={cn(R.script, "mt-4 text-[40px] leading-tight break-words")}>
        {partner.displayName}
      </h3>
      {full && full !== partner.displayName && (
        <p className={cn(R.serif, "mt-1 text-lg font-semibold")}>{full}</p>
      )}
      {parents && (
        <p className={cn(R.serif, R.muted, "mt-2 max-w-xs text-[16px] leading-snug")}>{parents}</p>
      )}
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
      <div className="flex flex-col items-center gap-6">
        <Person partner={data.partners.a} locale={data.locale} />
        <span className={cn(R.script, "text-5xl text-[#c99a8f]")} aria-hidden>
          &amp;
        </span>
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
    <Section className="text-center">
      <p className={cn(R.sans, R.kicker, "text-[11px] font-semibold uppercase tracking-[0.32em]")}>
        {templateLabel(data.locale, "countdownKicker")}
      </p>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {cells.map(([value, key]) => (
          <div key={key} className={cn(R.card, "rounded-[22px] py-4")}>
            <p className={cn(R.serif, "text-[30px] font-semibold leading-none tabular-nums")}>
              {value === undefined ? "--" : String(value).padStart(2, "0")}
            </p>
            <p className={cn(R.sans, R.muted, "mt-2 text-[10px] uppercase tracking-[0.18em]")}>
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
      <div className="flex flex-col gap-6">
        {data.events.map((event) => (
          <article key={event.id} className={cn(R.card, "px-7 py-9 text-center")}>
            <h3 className={cn(R.script, "text-[40px] leading-tight")}>{event.title}</h3>
            <FloralDivider className="mx-auto my-3 h-5 w-28" />
            {event.dateLabel && (
              <p className={cn(R.serif, "text-[19px] font-semibold")}>{event.dateLabel}</p>
            )}
            {event.timeLabel && (
              <p className={cn(R.serif, R.muted, "mt-1 text-[17px] italic")}>{event.timeLabel}</p>
            )}
            {event.venueName && (
              <p className={cn(R.sans, "mt-5 text-[15px] font-semibold")}>{event.venueName}</p>
            )}
            {event.venueAddress && (
              <p className={cn(R.serif, R.muted, "mt-1 text-[16px] leading-snug")}>
                {event.venueAddress}
              </p>
            )}
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {event.mapsUrl && (
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={R.ghostPill}
                >
                  {templateLabel(data.locale, "maps")}
                </a>
              )}
              <AddToCalendar event={event} names={names} className={R.ghostPill}>
                {templateLabel(data.locale, "addToCalendar")}
              </AddToCalendar>
            </div>
          </article>
        ))}
      </div>
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
      <p className={cn(R.serif, "text-center text-[19px] leading-relaxed whitespace-pre-line")}>
        {data.story}
      </p>
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
      <div className="columns-2 gap-3">
        {data.photoUrls.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            data-testid="gallery-photo"
            aria-label={photoLabel(data.locale, i, data.photoUrls.length)}
            onClick={() => setIndex(i)}
            className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-[20px] shadow-[0_8px_22px_-16px_rgba(122,74,64,0.7)]"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="w-full transition duration-500 hover:scale-[1.03]"
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
        className="fixed inset-0 z-[60] flex items-center justify-center bg-[#3d2520]/90 p-4"
        imageClassName="max-h-[85vh] max-w-full rounded-2xl object-contain"
        buttonClassName="grid h-11 w-11 place-items-center rounded-full bg-[#f6ede8]/90 text-2xl text-[#7a4a40] absolute"
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
      <div className="flex flex-col gap-4">
        {data.gifts.map((gift) => (
          <div key={gift.id} className={cn(R.card, "px-6 py-7 text-center")}>
            {gift.kind === "address" ? (
              <>
                <p
                  className={cn(
                    R.sans,
                    R.kicker,
                    "text-[11px] font-semibold uppercase tracking-[0.28em]",
                  )}
                >
                  {gift.recipient}
                </p>
                <p className={cn(R.serif, "mt-3 text-[17px] leading-relaxed")}>{gift.address}</p>
                <CopyButton
                  value={gift.address}
                  locale={data.locale}
                  kind="address"
                  className={cn(R.ghostPill, "mt-5")}
                />
              </>
            ) : (
              <>
                <p
                  className={cn(
                    R.sans,
                    R.kicker,
                    "text-[11px] font-semibold uppercase tracking-[0.28em]",
                  )}
                >
                  {gift.kind === "bank" ? gift.bankName : gift.provider.toUpperCase()}
                </p>
                <p
                  className={cn(
                    R.serif,
                    "mt-3 text-[26px] font-semibold tracking-[0.08em] tabular-nums",
                  )}
                >
                  {gift.accountNumber}
                </p>
                <p className={cn(R.serif, R.muted, "text-[16px] italic")}>{gift.accountName}</p>
                <CopyButton
                  value={gift.accountNumber}
                  locale={data.locale}
                  className={cn(R.ghostPill, "mt-5")}
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
  "w-full rounded-2xl border border-[#e3c6bd] bg-[#fffaf8] px-4 text-[16px] text-[#7a4a40] outline-none placeholder:text-[#86594f]/70 focus:border-[#c99a8f] focus:ring-2 focus:ring-[#f0d5cd]";

export function Rsvp({
  data,
  onSubmit,
  guestName,
}: D & { onSubmit?: RsvpHandler; guestName?: string }) {
  const t = (k: Parameters<typeof templateLabel>[1]) => templateLabel(data.locale, k);
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
            <p className={cn(R.card, R.serif, R.muted, "px-6 py-7 text-center text-[17px] italic")}>
              {t("rsvpDisabled")}
            </p>
          ) : api.done ? (
            <p className={cn(R.card, R.serif, "px-6 py-7 text-center text-[18px]")}>
              {t("rsvpThanks")}
            </p>
          ) : (
            <form
              onSubmit={(e) => void api.submit(e)}
              className={cn(R.card, R.sans, "space-y-4 px-6 py-8")}
            >
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
              <div className="grid grid-cols-2 gap-2">
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
                      "min-h-12 rounded-full border text-[13px] font-semibold uppercase tracking-[0.12em] transition",
                      api.status === value
                        ? "border-transparent bg-[#7a4a40] text-[#f6ede8]"
                        : "border-[#e3c6bd] bg-[#fffaf8] text-[#7a4a40]",
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
              {api.error && <p className="text-[15px] text-[#9b2c2c]">{api.error}</p>}
              <button type="submit" disabled={api.busy} className={cn(R.pill, "w-full")}>
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
    <Section className="pb-8 text-center">
      <p className={cn(R.sans, R.kicker, "text-[11px] font-semibold uppercase tracking-[0.32em]")}>
        {templateLabel(data.locale, "closingKicker")}
      </p>
      {closing && (
        <p className={cn(R.serif, "mt-6 text-[19px] italic leading-relaxed")}>{closing}</p>
      )}
      <FloralDivider className="mx-auto mt-8 h-6 w-36" />
      <p className={cn(R.script, "mt-4 text-[48px] leading-tight break-words")}>
        {data.partnerAName} &amp; {data.partnerBName}
      </p>
    </Section>
  );
}
