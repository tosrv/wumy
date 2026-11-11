/**
 * Modern template (product id: `modern`) — "Grid brutalist".
 * Black ground, 22 px line grid, giant Space Grotesk caps, lime accent.
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
import { sectionNumbers } from "./section-numbers";
import { FONTS_HREF, GRID_STYLE, T } from "./parts";
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

export function ModernInvitation({
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
          "relative mx-auto outline-none max-w-[720px] transition-opacity duration-700 motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {open && (
          <>
            <Opening data={data} no={no.opening ?? 0} />
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
            <Closing data={data} no={no.closing ?? 0} />
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

/** "DD/MM/YYYY — CITY" from the ISO date and the first event's address. */
function ticketLabel(data: InvitationViewModel): string {
  const m = data.weddingDateIso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(data.weddingDateIso) : null;
  const date = m ? `${m[3]}/${m[2]}/${m[1]}` : "";
  const address = data.events[0]?.venueAddress ?? "";
  const city = (address.split(",").pop() ?? "").trim().toUpperCase();
  return [date, city].filter(Boolean).join(" — ");
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
  const ticket = ticketLabel(data);
  const venue = data.events[0]?.venueName ?? data.venueName;
  const fade =
    "transition-[opacity,transform] duration-[800ms] ease-out motion-reduce:transition-none";
  return (
    <section
      data-testid="cover"
      className={cn(
        T.bg,
        "z-[60] overflow-hidden",
        embedded ? "absolute inset-0" : "fixed inset-0",
        opening && "pointer-events-none",
      )}
    >
      <div
        aria-hidden
        style={GRID_STYLE}
        className={cn(
          "absolute inset-0 transition-opacity duration-[900ms] ease-out motion-reduce:transition-none",
          opening ? "opacity-0" : "opacity-100",
        )}
      />
      <div className="relative mx-auto flex h-full max-w-[720px] flex-col px-5 py-6 sm:px-8 sm:py-8">
        {ticket && (
          <p
            className={cn(
              T.accent,
              fade,
              "self-start border border-[#d4f932] px-3 py-1.5 text-[12px] font-semibold tracking-[0.22em]",
              opening ? "opacity-0" : "opacity-100",
            )}
          >
            {ticket}
          </p>
        )}
        <div
          className={cn(
            fade,
            "flex flex-1 flex-col justify-center",
            opening ? "-translate-y-6 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          <h1
            data-testid="cover-names"
            className="w-full text-[clamp(52px,16vw,96px)] font-bold uppercase leading-[0.9] tracking-[-0.04em] [overflow-wrap:anywhere]"
          >
            <span className="block">{data.partnerAName}</span>
            <span className={cn(T.accent, "block")} aria-hidden>
              ×
            </span>
            <span className="block">{data.partnerBName}</span>
          </h1>
          {guestName && (
            <p className="mt-8 text-[16px]">
              <span className={T.muted}>{templateLabel(data.locale, "to")}</span>{" "}
              <span className="font-semibold">{guestName}</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            T.rule,
            fade,
            "flex items-end justify-between gap-4 border-t pt-4",
            opening ? "opacity-0" : "opacity-100",
          )}
        >
          <p
            className={cn(
              T.muted,
              "min-w-0 text-[15px] uppercase leading-snug tracking-[0.08em] [overflow-wrap:anywhere]",
            )}
          >
            {venue}
          </p>
          <button type="button" onClick={onOpen} className={cn(T.button, "shrink-0")}>
            {templateLabel(data.locale, "openInvitation")} <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
