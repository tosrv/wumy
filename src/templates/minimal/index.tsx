/**
 * Minimal template (product id: `minimal`) — "Gallery frame".
 * Off-white ground, inset cover photo, spaced Inter caps, hairline rules.
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

export function MinimalInvitation({
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
          "relative mx-auto outline-none max-w-[560px] transition-opacity duration-700 motion-reduce:transition-none",
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
  return (
    <section
      data-testid="cover"
      className={cn(
        T.bg,
        "z-[60] overflow-hidden transition-opacity duration-[900ms] ease-out motion-reduce:transition-none",
        embedded ? "absolute inset-0" : "fixed inset-0",
        opening ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="mx-auto flex h-full max-w-[560px] flex-col">
        <div className="relative mx-[18px] mt-[18px] h-[60%] shrink-0 overflow-hidden bg-[#e7e3dc] outline outline-1 outline-offset-[6px] outline-[#111111]/10">
          <div
            className={cn(
              "h-full w-full transition-transform duration-[900ms] ease-out motion-reduce:transition-none",
              opening ? "scale-[1.08]" : "scale-100",
            )}
          >
            {data.coverPhotoUrl ? (
              <img src={data.coverPhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                data-testid="cover-fallback"
                aria-hidden
                className="flex h-full items-center justify-center text-[clamp(56px,18vw,96px)] font-light tracking-[0.08em] text-[#111111]/75"
              >
                {data.partnerAName.trim().slice(0, 1).toUpperCase()}
                <span className="mx-[0.25em] text-[0.6em]">&amp;</span>
                {data.partnerBName.trim().slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-6 text-center">
          <h1
            data-testid="cover-names"
            className="w-full text-[clamp(22px,7vw,28px)] font-light uppercase leading-[1.3] tracking-[0.2em] [overflow-wrap:anywhere]"
          >
            <span>{data.partnerAName}</span>
            <span className="mx-[0.4em]" aria-hidden>
              ·
            </span>
            <span>{data.partnerBName}</span>
          </h1>
          {data.weddingDateLabel && <p className={cn(T.label, "mt-3")}>{data.weddingDateLabel}</p>}
          {guestName && (
            <p className="mt-4 text-[15px]">
              <span className={T.muted}>{templateLabel(data.locale, "to")}</span>{" "}
              <span className="font-semibold">{guestName}</span>
            </p>
          )}
          <button type="button" onClick={onOpen} className={cn(T.button, "mt-5 px-9")}>
            {templateLabel(data.locale, "openInvitation")}
          </button>
        </div>
      </div>
    </section>
  );
}
