/**
 * Playful template (product id: `playful`) — "Neo-brutal card".
 * Lime ground, white ink-bordered cards with hard shadows, pink stickers, Syne + Inter.
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
import { FONTS_HREF, T } from "./parts";
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

export function PlayfulInvitation({
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

  return (
    <div
      className={cn(
        T.lime,
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
          "relative outline-none transition-opacity duration-700 motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {open && (
          <>
            <Opening data={data} />
            <Couple data={data} />
            <Countdown data={data} />
            <Events data={data} />
            <Story data={data} />
            <Gallery data={data} />
            <Gifts data={data} />
            <Rsvp
              data={data}
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
  const date = data.events[0]?.dateLabel ?? "";
  return (
    <section
      data-testid="cover"
      className={cn(
        T.lime,
        "z-[60] flex items-center justify-center overflow-hidden px-6",
        embedded ? "absolute inset-0" : "fixed inset-0",
        opening && "pointer-events-none",
      )}
    >
      <div
        className={cn(
          T.card,
          "relative w-full max-w-[420px] px-6 pt-12 pb-8 text-center transition-[opacity,transform] duration-[800ms] ease-in motion-reduce:transition-none",
          opening ? "translate-y-10 rotate-[4deg] opacity-0" : "translate-y-0 rotate-0 opacity-100",
        )}
      >
        <p
          className={cn(
            T.sticker,
            T.pink,
            "absolute -top-4 -left-3 -rotate-6 px-4 py-1.5 text-[13px] font-bold",
          )}
        >
          {templateLabel(data.locale, "saveTheDate")}
        </p>
        <h1
          data-testid="cover-names"
          className={cn(
            T.display,
            "w-full text-[clamp(28px,8.6vw,44px)] font-extrabold leading-[1.02] tracking-[-0.02em] [overflow-wrap:anywhere]",
          )}
        >
          <span className="block">{data.partnerAName}</span>
          <span className="block text-[#ff8fb1] [-webkit-text-stroke:1.5px_#1b1b1b]" aria-hidden>
            &amp;
          </span>
          <span className="block">{data.partnerBName}</span>
        </h1>
        {date && <p className="mt-5 text-[16px] font-semibold">{date}</p>}
        {guestName && (
          <p className="mt-6 rounded-2xl border-2 border-dashed border-[#1b1b1b] px-4 py-3 text-[15px]">
            <span className={T.muted}>{templateLabel(data.locale, "to")}</span>{" "}
            <span className="font-semibold [overflow-wrap:anywhere]">{guestName}</span>
          </p>
        )}
        <button type="button" onClick={onOpen} className={cn(T.button, T.press, "mt-7")}>
          {templateLabel(data.locale, "openInvitation")}
        </button>
      </div>
    </section>
  );
}
