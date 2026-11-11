/**
 * Romantic template (product id: `romantic`) — "Floral blush".
 * Blush paper, line-art florals, script names.
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
import { FloralGarland } from "./ornaments";
import { FONTS_HREF, R } from "./parts";
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

export function RomanticInvitation({
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
        R.bg,
        R.ink,
        R.serif,
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
          "relative mx-auto outline-none max-w-[480px] transition-opacity duration-700 motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <FloralGarland className="pointer-events-none mx-auto block w-full opacity-80" />
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
        <FloralGarland flip className="pointer-events-none mx-auto block w-full opacity-80" />
        {music.available && open && (
          <MusicToggle
            playing={music.playing}
            onToggle={music.toggle}
            locale={data.locale}
            className={R.music}
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
  const flowers = cn(
    "pointer-events-none absolute left-1/2 w-[min(118vw,560px)] -translate-x-1/2 transition-[opacity,transform] duration-[900ms] ease-in motion-reduce:transition-none",
    opening ? "opacity-0" : "opacity-100",
  );
  return (
    <section
      data-testid="cover"
      className={cn(
        R.bg,
        "z-[60] overflow-hidden transition-opacity duration-[900ms] ease-in motion-reduce:transition-none",
        embedded ? "absolute inset-0" : "fixed inset-0",
        opening ? "opacity-0" : "opacity-100",
      )}
    >
      <div className={cn(flowers, "top-0", opening ? "scale-125" : "scale-100")}>
        <FloralGarland className="block w-full" />
      </div>
      <div className={cn(flowers, "bottom-0", opening ? "scale-125" : "scale-100")}>
        <FloralGarland flip className="block w-full" />
      </div>
      <div
        className={cn(
          "relative flex h-full flex-col items-center justify-center px-8 text-center transition-transform duration-[900ms] ease-in motion-reduce:transition-none",
          opening ? "-translate-y-10" : "translate-y-0",
        )}
      >
        <p
          className={cn(R.sans, R.kicker, "text-[11px] font-semibold uppercase tracking-[0.36em]")}
        >
          {templateLabel(data.locale, "theWeddingOf")}
        </p>
        <h1
          data-testid="cover-names"
          className={cn(
            R.script,
            "mt-5 w-full max-w-[420px] text-[clamp(40px,12vw,52px)] leading-[1.15] [overflow-wrap:anywhere]",
          )}
        >
          <span className="block">{data.partnerAName}</span>
          <span className="block text-[0.7em] text-[#c99a8f]">&amp;</span>
          <span className="block">{data.partnerBName}</span>
        </h1>
        {data.weddingDateLabel && (
          <p className={cn(R.serif, "mt-5 text-[19px] italic")}>{data.weddingDateLabel}</p>
        )}
        {guestName && (
          <div className="mt-8">
            <p className={cn(R.sans, R.muted, "text-[11px] uppercase tracking-[0.28em]")}>
              {templateLabel(data.locale, "to")}
            </p>
            <p className={cn(R.serif, "mt-1 text-[22px] font-semibold")}>{guestName}</p>
          </div>
        )}
        <button type="button" onClick={onOpen} className={cn(R.sans, R.pill, "mt-9 px-8")}>
          {templateLabel(data.locale, "openInvitation")}
        </button>
      </div>
    </section>
  );
}
