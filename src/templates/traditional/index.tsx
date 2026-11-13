/**
 * Traditional template (product id: `traditional`) — "Keraton Emas".
 * Dark wood ground with a drifting kawung field, gold dust, carved gebyok doors that
 * swing open, a slowly turning medallion, and script names.
 */
import type { InvitationViewModel } from "@/components/invitations/types";
import { cn } from "@/lib/utils";
import {
  DriftPattern,
  MusicToggle,
  ParticleField,
  TemplateFonts,
  useBackgroundMusic,
  useOpenGate,
  type TemplateSkinProps,
} from "@/templates/shared";
import { templateLabel } from "../labels";
import { CoverMedallion, GebyokPanel, KawungPattern } from "./ornaments";
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

/** Door swing length; longer than the shared default so the 3D swing reads. */
export const TRADITIONAL_OPEN_MS = 1300;

/** Gold dust colour as `r g b` for `ParticleField`. */
const DUST = "240 205 120";

export function TraditionalInvitation({
  data,
  startOpened = false,
  embedded = false,
  onSubmitRsvp,
  rsvpGuestName,
  className,
}: TemplateSkinProps) {
  const { open, opening, openGate, mainRef, userOpened } = useOpenGate({
    startOpened,
    durationMs: TRADITIONAL_OPEN_MS,
  });
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
          "relative isolate mx-auto outline-none max-w-[480px] border-x border-[#c9a45c]/25 transition-opacity duration-700 motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {open && (
          <>
            <AmbientLayer embedded={embedded} />
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

/**
 * Background behind the opened invitation: drifting kawung and a little gold dust.
 * Pinned to the viewport on the public page so the layers stay screen-sized on long
 * pages; inside the editor preview it fills the preview and skips the particles.
 */
function AmbientLayer({ embedded }: { embedded: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none -z-10",
        embedded
          ? "absolute inset-0"
          : "fixed inset-y-0 left-1/2 w-full max-w-[480px] -translate-x-1/2",
      )}
    >
      <DriftPattern>
        <KawungPattern className="h-full w-full" />
      </DriftPattern>
      {!embedded && <ParticleField kind="gold-dust" density="ambient" color={DUST} />}
    </div>
  );
}

/** One gebyok door leaf; swings open around its outer edge. */
function Door({ side, opening }: { side: "left" | "right"; opening: boolean }) {
  const left = side === "left";
  return (
    <div
      aria-hidden
      style={{ transitionDuration: `${TRADITIONAL_OPEN_MS}ms` }}
      className={cn(
        "absolute inset-y-0 w-1/2 transition-transform ease-[cubic-bezier(.7,0,.2,1)] [backface-visibility:hidden] motion-reduce:transition-none",
        left ? "left-0 origin-left" : "right-0 origin-right",
        opening && (left ? "[transform:rotateY(-100deg)]" : "[transform:rotateY(100deg)]"),
      )}
    >
      <GebyokPanel side={side} />
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
        "z-[60] overflow-hidden [perspective:1200px]",
        embedded ? "absolute inset-0" : "fixed inset-0",
      )}
    >
      <Door side="left" opening={opening} />
      <Door side="right" opening={opening} />
      <div
        className={cn(
          "relative flex h-full flex-col items-center justify-center-safe overflow-y-auto px-12 py-10 text-center transition-opacity duration-300 ease-out motion-reduce:transition-none",
          opening ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="relative isolate flex w-full max-w-[420px] flex-col items-center">
          <CoverMedallion className="animate-wumy-spin pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
          <p className={cn(T.display, T.label, "tracking-[0.42em]")}>
            {templateLabel(data.locale, "theWeddingOf")}
          </p>
          <h1
            data-testid="cover-names"
            className={cn(
              T.script,
              T.gold,
              "mt-4 w-full text-[clamp(32px,min(12vw,7svh),54px)] leading-[1.1] [overflow-wrap:anywhere]",
            )}
          >
            <span className="block">{data.partnerAName}</span>
            <span className={cn(T.serif, "my-1 block text-[0.55em] italic")}>&amp;</span>
            <span className="block">{data.partnerBName}</span>
          </h1>
          {data.weddingDateLabel && (
            <p className={cn(T.serif, "mt-5 text-[20px] italic")}>{data.weddingDateLabel}</p>
          )}
        </div>
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
      <ParticleField kind="gold-dust" density="cover" color={DUST} className="z-10" />
    </section>
  );
}
