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
import { Corners, DiamondDivider, Gunungan } from "./ornaments";
import { Section, SectionTitle, T } from "./parts";

type D = { data: InvitationViewModel };

export function Opening({ data }: D) {
  const greeting = data.greeting.trim();
  const quote = data.quote.trim();
  if (!greeting && !quote) return null;
  return (
    <Section className="pt-12 text-center">
      <Gunungan className="mx-auto h-16 w-24" />
      <p className={cn(T.display, T.label, "mt-4")}>
        {templateLabel(data.locale, "openingKicker")}
      </p>
      <DiamondDivider className="mx-auto mt-4 h-4 w-36" />
      {greeting && (
        <p className={cn(T.serif, "mx-auto mt-6 text-[19px] leading-relaxed")}>{greeting}</p>
      )}
      {quote && (
        <figure className={cn(T.card, "mt-10 px-7 py-10")}>
          <Corners />
          <blockquote className={cn(T.serif, "text-[19px] italic leading-relaxed")}>
            {quote}
          </blockquote>
          {data.quoteSource.trim() && (
            <figcaption className={cn(T.display, T.label, "mt-5 tracking-[0.24em]")}>
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
      <div className="rounded-t-full border border-[#c9a45c] p-2">
        <div className="h-64 w-48 overflow-hidden rounded-t-full border-2 border-[#c9a45c] bg-[#3a2a1e]">
          {partner.photoUrl ? (
            <img
              src={partner.photoUrl}
              alt={partner.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={cn(
                T.display,
                T.gold,
                "flex h-full items-center justify-center text-[64px] font-semibold",
              )}
            >
              {partner.displayName.slice(0, 1)}
            </div>
          )}
        </div>
      </div>
      <h3
        className={cn(
          T.display,
          "mt-6 text-[24px] font-semibold uppercase leading-tight tracking-[0.12em] [overflow-wrap:anywhere]",
        )}
      >
        {partner.displayName}
      </h3>
      {full && full !== partner.displayName && (
        <p className={cn(T.serif, T.gold, "mt-1 text-[19px] italic")}>{full}</p>
      )}
      {parents && (
        <p className={cn(T.serif, T.muted, "mt-2 max-w-xs text-[17px] leading-snug")}>{parents}</p>
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
      <div className="flex flex-col items-center gap-8">
        <Person partner={data.partners.a} locale={data.locale} />
        <span className={cn(T.serif, T.gold, "text-[48px] italic leading-none")} aria-hidden>
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
      <p className={cn(T.display, T.label)}>{templateLabel(data.locale, "countdownKicker")}</p>
      <DiamondDivider className="mx-auto mt-4 h-4 w-36" />
      <div className="mt-6 grid grid-cols-4 gap-2">
        {cells.map(([value, key]) => (
          <div key={key} className={cn(T.card, "py-4")}>
            <p
              className={cn(
                T.display,
                T.gold,
                "text-[26px] font-semibold leading-none tabular-nums",
              )}
            >
              {value === undefined ? "--" : String(value).padStart(2, "0")}
            </p>
            <p className={cn(T.serif, T.muted, "mt-2 text-[15px]")}>
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
          <article key={event.id} className={cn(T.card, "px-7 py-10 text-center")}>
            <Corners />
            <h3
              className={cn(
                T.display,
                T.gold,
                "text-[22px] font-semibold uppercase leading-tight tracking-[0.14em]",
              )}
            >
              {event.title}
            </h3>
            <DiamondDivider className="mx-auto my-4 h-3 w-28" />
            {event.dateLabel && (
              <p className={cn(T.serif, "text-[20px] font-semibold")}>{event.dateLabel}</p>
            )}
            {event.timeLabel && (
              <p className={cn(T.serif, T.muted, "mt-1 text-[18px] italic")}>{event.timeLabel}</p>
            )}
            {event.venueName && (
              <p className={cn(T.display, "mt-5 text-[15px] font-semibold tracking-[0.08em]")}>
                {event.venueName}
              </p>
            )}
            {event.venueAddress && (
              <p className={cn(T.serif, T.muted, "mt-1 text-[17px] leading-snug")}>
                {event.venueAddress}
              </p>
            )}
            <div className="mt-7 flex flex-wrap justify-center gap-3">
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
      <p className={cn(T.serif, "text-center text-[19px] leading-relaxed whitespace-pre-line")}>
        {data.story}
      </p>
    </Section>
  );
}

export function Gallery({ data }: D) {
  const [index, setIndex] = useState<number | null>(null);
  if (data.photoUrls.length === 0) return null;
  return (
    <Section className="px-0">
      <div className="px-6">
        <SectionTitle
          kicker={templateLabel(data.locale, "galleryKicker")}
          title={templateLabel(data.locale, "galleryTitle")}
        />
      </div>
      <div
        role="region"
        tabIndex={0}
        aria-label={templateLabel(data.locale, "galleryRegion")}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:thin] [scrollbar-color:#c9a45c_transparent]"
      >
        {data.photoUrls.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            data-testid="gallery-photo"
            aria-label={photoLabel(data.locale, i, data.photoUrls.length)}
            onClick={() => setIndex(i)}
            className="w-[72%] shrink-0 snap-center border border-[#c9a45c] p-1.5"
          >
            <span className="block aspect-[3/4] overflow-hidden border border-[#c9a45c]/50">
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
              />
            </span>
          </button>
        ))}
      </div>
      <Lightbox
        photos={data.photoUrls}
        index={index}
        onClose={() => setIndex(null)}
        onIndex={setIndex}
        locale={data.locale}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1a110b]/95 p-4"
        imageClassName="max-h-[85vh] max-w-full border border-[#c9a45c] object-contain p-1"
        buttonClassName="grid h-11 w-11 place-items-center border border-[#c9a45c] bg-[#2b1d14]/90 text-2xl text-[#c9a45c] absolute"
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
          <div key={gift.id} className={cn(T.card, "px-6 py-8 text-center")}>
            <Corners />
            {gift.kind === "address" ? (
              <>
                <p className={cn(T.display, T.label)}>{gift.recipient}</p>
                <p className={cn(T.serif, "mt-3 text-[18px] leading-relaxed")}>{gift.address}</p>
                <CopyButton
                  value={gift.address}
                  locale={data.locale}
                  kind="address"
                  className={cn(T.ghost, "mt-5")}
                />
              </>
            ) : (
              <>
                <p className={cn(T.display, T.label)}>
                  {gift.kind === "bank" ? gift.bankName : gift.provider.toUpperCase()}
                </p>
                <p
                  className={cn(
                    T.display,
                    "mt-3 text-[22px] font-semibold tracking-[0.1em] tabular-nums",
                  )}
                >
                  {gift.accountNumber}
                </p>
                <p className={cn(T.serif, T.muted, "text-[17px] italic")}>{gift.accountName}</p>
                <CopyButton
                  value={gift.accountNumber}
                  locale={data.locale}
                  className={cn(T.ghost, "mt-5")}
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
  "w-full border border-[#c9a45c]/60 bg-[#2b1d14] px-4 text-[17px] text-[#f3e6c8] outline-none placeholder:text-[#d8c7a2]/80 focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/30";

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
            <p className={cn(T.card, T.serif, T.muted, "px-6 py-8 text-center text-[18px] italic")}>
              {t("rsvpDisabled")}
            </p>
          ) : api.done ? (
            <p className={cn(T.card, T.serif, "px-6 py-8 text-center text-[19px]")}>
              {t("rsvpThanks")}
            </p>
          ) : (
            <form
              onSubmit={(e) => void api.submit(e)}
              className={cn(T.card, T.serif, "space-y-4 px-6 py-9")}
            >
              <Corners />
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
                      T.display,
                      "min-h-12 border text-[12px] font-semibold uppercase tracking-[0.12em] transition",
                      api.status === value
                        ? "border-transparent bg-[#c9a45c] text-[#2b1d14]"
                        : "border-[#c9a45c]/60 bg-[#2b1d14] text-[#f3e6c8]",
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
              {api.error && <p className="text-[16px] text-[#f2a38f]">{api.error}</p>}
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
    <Section className="pb-8 text-center">
      <p className={cn(T.display, T.label)}>{templateLabel(data.locale, "closingKicker")}</p>
      {closing && (
        <p className={cn(T.serif, "mt-6 text-[19px] italic leading-relaxed")}>{closing}</p>
      )}
      <DiamondDivider className="mx-auto mt-8 h-4 w-36" />
      <p
        className={cn(
          T.display,
          T.gold,
          "mt-5 text-[24px] font-semibold uppercase leading-snug tracking-[0.14em] [overflow-wrap:anywhere]",
        )}
      >
        {data.partnerAName}
        <span className={cn(T.serif, "mx-2 normal-case italic")}>&amp;</span>
        {data.partnerBName}
      </p>
      <Gunungan flip className="mx-auto mt-8 h-14 w-20" />
    </Section>
  );
}
