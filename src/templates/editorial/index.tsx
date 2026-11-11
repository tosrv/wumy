/**
 * Editorial template (product id: `editorial`) — "Magazine cover".
 * Paper ground, masthead, Playfair names, cover photo, pull quote; the cover
 * slides away like a turned page.
 */
import type { InvitationViewModel } from "@/components/invitations/types";
import { cn } from "@/lib/utils";
import {
  MusicToggle,
  TemplateFonts,
  useBackgroundMusic,
  useOpenGate,
  type TemplateSkinProps,
} from "@/templates/shared";
import { templateLabel } from "../labels";
import { FONTS_HREF, Names, T } from "./parts";
import { pullQuote } from "./pull-quote";
import { sectionNumbers } from "./section-numbers";
import {
  Closing,
  Countdown,
  Couple,
  Events,
  Gallery,
  Gifts,
  Opening,
  Rsvp,
  Story,
} from "./sections";

export function EditorialInvitation({
  data,
  startOpened = false,
  embedded = false,
  onSubmitRsvp,
  rsvpGuestName,
  className,
}: TemplateSkinProps) {
  const { open, opening, openGate, mainRef, userOpened } = useOpenGate({ startOpened });
  const music = useBackgroundMusic(data.music, { userOpened });
  const guest = rsvpGuestName ?? data.guestName;
  const no = sectionNumbers(data);

  return (
    <div
      className={cn(
        T.bg,
        T.ink,
        T.sans,
        "relative overflow-x-hidden antialiased",
        embedded ? "min-h-full" : "min-h-screen",
        className,
      )}
    >
      <TemplateFonts href={FONTS_HREF} />
      {!open && (
        <Cover
          data={data}
          opening={opening}
          embedded={embedded}
          onOpen={openGate}
          {...(data.guestName ? { guestName: data.guestName } : {})}
        />
      )}
      <main
        ref={mainRef}
        tabIndex={-1}
        aria-hidden={!open}
        className={cn(
          "relative mx-auto max-w-[880px] outline-none transition-opacity duration-700 motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {open && (
          <>
            <Opening data={data} />
            <Couple data={data} no={no.couple ?? 0} />
            <Countdown data={data} no={no.countdown ?? 0} />
            <Events data={data} no={no.events ?? 0} />
            <Story data={data} no={no.story ?? 0} />
            <Gallery data={data} no={no.gallery ?? 0} />
            <Gifts data={data} no={no.gifts ?? 0} />
            <Rsvp
              data={data}
              no={no.rsvp ?? 0}
              {...(onSubmitRsvp ? { onSubmit: onSubmitRsvp } : {})}
              {...(guest ? { guestName: guest } : {})}
            />
            <Closing data={data} />
          </>
        )}
        {music.available && open && (
          <MusicToggle
            playing={music.playing}
            onToggle={music.toggle}
            locale={data.locale}
            className={T.music}
          />
        )}
      </main>
    </div>
  );
}

const initial = (name: string) => name.trim().slice(0, 1).toUpperCase();

/** City = last comma-separated part of the first event's address. */
function coverCity(data: InvitationViewModel) {
  return (data.events[0]?.venueAddress.split(",").pop() ?? "").trim();
}

function Cover({
  data,
  opening,
  embedded,
  guestName,
  onOpen,
}: {
  data: InvitationViewModel;
  opening: boolean;
  embedded: boolean;
  guestName?: string;
  onOpen: () => void;
}) {
  const year = data.weddingDateIso?.slice(0, 4);
  const quote = pullQuote(data.quote);
  const city = coverCity(data);
  return (
    <section
      data-testid="cover"
      className={cn(
        T.bg,
        "z-[60] overflow-y-auto shadow-[12px_0_40px_-20px_rgba(0,0,0,0.35)] transition-transform duration-[900ms] ease-in-out motion-reduce:transition-none",
        embedded ? "absolute inset-0" : "fixed inset-0",
        opening ? "pointer-events-none -translate-x-full" : "translate-x-0",
      )}
    >
      <div className="mx-auto flex min-h-full max-w-[560px] flex-col px-6 pb-8 pt-5">
        <div
          className={cn(
            T.rule,
            "flex items-center justify-between gap-3 border-b pb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1a1a1a]",
          )}
        >
          <span>Vol. 01</span>
          <span className="text-center">{templateLabel(data.locale, "theWeddingIssue")}</span>
          {year ? <span>{year}</span> : <span aria-hidden />}
        </div>
        <h1
          data-testid="cover-names"
          className={cn(
            T.serif,
            "mt-6 w-full text-[clamp(40px,12.5vw,52px)] font-bold leading-[0.95] tracking-[-0.03em] [overflow-wrap:anywhere]",
          )}
        >
          <Names
            a={data.partnerAName}
            b={data.partnerBName}
            and={templateLabel(data.locale, "and")}
          />
        </h1>
        <div className={cn(T.stone, "relative mt-6 min-h-[240px] flex-1 overflow-hidden")}>
          {data.coverPhotoUrl ? (
            <img
              src={data.coverPhotoUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              data-testid="cover-fallback"
              aria-hidden
              className={cn(
                T.serif,
                "absolute inset-0 flex items-center justify-center text-[clamp(64px,22vw,112px)] italic text-[#1a1a1a]/70",
              )}
            >
              {initial(data.partnerAName)}
              <span className="mx-[0.15em] text-[0.6em]">&amp;</span>
              {initial(data.partnerBName)}
            </div>
          )}
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
          <div>
            {quote && <p className={cn(T.serif, "text-[15px] italic leading-[1.45]")}>“{quote}”</p>}
          </div>
          <div className="text-right text-[11px] font-semibold uppercase leading-[1.7] tracking-[0.2em]">
            {data.weddingDateLabel && <p>{data.weddingDateLabel}</p>}
            {city && <p className={T.muted}>{city}</p>}
          </div>
        </div>
        {guestName && (
          <p className={cn(T.rule, "mt-5 border-t pt-4 text-[15px]")}>
            <span className={T.muted}>{templateLabel(data.locale, "to")}</span>{" "}
            <span className="font-semibold">{guestName}</span>
          </p>
        )}
        <button type="button" onClick={onOpen} className={cn(T.ghost, "mt-5 w-full")}>
          {templateLabel(data.locale, "openInvitation")}
        </button>
      </div>
    </section>
  );
}
