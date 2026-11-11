/**
 * Traditional template (product id: `traditional`) — "Keraton gold".
 * Dark wood ground, double gold frame, gunungan ornament, Cinzel names.
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
import { Gunungan, SideFlourish } from "./ornaments";
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

export function TraditionalInvitation({
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
        T.bg,
        T.ink,
        T.serif,
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
          "relative mx-auto outline-none max-w-[480px] border-x border-[#c9a45c]/25 transition-opacity duration-700 motion-reduce:transition-none",
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

/** One half of the gate: dark ground with the double frame, clipped to its side. */
function GatePanel({ side, opening }: { side: "left" | "right"; opening: boolean }) {
  const left = side === "left";
  return (
    <div
      aria-hidden
      className={cn(
        T.bg,
        "absolute inset-y-0 w-1/2 overflow-hidden transition-transform duration-[900ms] ease-in-out motion-reduce:transition-none",
        left ? "left-0" : "right-0",
        opening ? (left ? "-translate-x-full" : "translate-x-full") : "translate-x-0",
      )}
    >
      <div className={cn("absolute inset-y-0 w-[200%]", left ? "left-0" : "right-0")}>
        <div className="absolute inset-3 border border-[#c9a45c]" />
        <div className="absolute inset-[18px] border border-[#c9a45c]/60" />
        <SideFlourish className="absolute left-6 top-1/2 h-60 w-6 -translate-y-1/2 opacity-35" />
        <SideFlourish className="absolute right-6 top-1/2 h-60 w-6 -translate-y-1/2 opacity-35" />
        <Gunungan className="absolute left-1/2 top-7 h-20 w-32 -translate-x-1/2" />
        <Gunungan flip className="absolute bottom-7 left-1/2 h-20 w-32 -translate-x-1/2" />
      </div>
      <div
        className={cn(
          "absolute inset-y-0 w-px bg-[#c9a45c]/50",
          left ? "right-0" : "left-0",
          opening ? "opacity-100" : "opacity-0",
        )}
      />
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
  return (
    <section
      data-testid="cover"
      className={cn("z-[60] overflow-hidden", embedded ? "absolute inset-0" : "fixed inset-0")}
    >
      <GatePanel side="left" opening={opening} />
      <GatePanel side="right" opening={opening} />
      <div
        className={cn(
          "relative flex h-full flex-col items-center justify-center px-12 text-center transition-opacity duration-300 ease-out motion-reduce:transition-none",
          opening ? "opacity-0" : "opacity-100",
        )}
      >
        <p className={cn(T.display, T.label, "tracking-[0.42em]")}>
          {templateLabel(data.locale, "theWeddingOf")}
        </p>
        <h1
          data-testid="cover-names"
          className={cn(
            T.display,
            "mt-6 w-full max-w-[420px] text-[clamp(24px,7.4vw,30px)] font-semibold uppercase leading-[1.25] tracking-[0.12em] [overflow-wrap:anywhere]",
          )}
        >
          <span className="block">{data.partnerAName}</span>
          <span
            className={cn(
              T.serif,
              T.gold,
              "my-1 block text-[1.3em] font-normal normal-case italic",
            )}
          >
            &amp;
          </span>
          <span className="block">{data.partnerBName}</span>
        </h1>
        {data.weddingDateLabel && (
          <p className={cn(T.serif, T.gold, "mt-6 text-[20px] italic")}>{data.weddingDateLabel}</p>
        )}
        {guestName && (
          <div className="mt-8">
            <p className={cn(T.serif, T.muted, "text-[15px] italic")}>
              {templateLabel(data.locale, "to")}
            </p>
            <p className={cn(T.display, "mt-1 text-[18px] font-semibold tracking-[0.06em]")}>
              {guestName}
            </p>
          </div>
        )}
        <button type="button" onClick={onOpen} className={cn(T.button, "mt-9 px-8")}>
          {templateLabel(data.locale, "openInvitation")}
        </button>
      </div>
    </section>
  );
}
