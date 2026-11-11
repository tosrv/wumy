import { A } from "@/components/A";
import { useHeroMotion } from "@/hooks/usePageMotion";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact";

/** Real contact channels only: WhatsApp (fastest) and email. */
export function ContactPage() {
  const hero = useHeroMotion();

  return (
    <main className="w-full bg-surface-canvas pt-20">
      <section className="mx-auto max-w-[1240px] px-margin pb-space-lg pt-space-xl md:px-margin-tablet md:pb-space-xl md:pt-space-2xl lg:px-margin-desktop">
        <div className="flex max-w-3xl flex-col items-start gap-space-sm">
          <div
            className={`inline-flex items-center gap-2 rounded-full bg-surface-card px-3.5 py-1.5 shadow-sm ${hero.fade(0).className}`}
            style={hero.fade(0).style}
          >
            <span className="h-2 w-2 rounded-full bg-electric-lime"></span>
            <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-widest text-charcoal">
              KONTAK
            </span>
          </div>
          <h1
            className={`mt-space-xs font-headline-xl text-headline-xl tracking-tight text-charcoal md:text-headline-hero ${hero.fade(120).className}`}
            style={hero.fade(120).style}
          >
            Ada pertanyaan? Tanya saja.
          </h1>
          <p
            className={`max-w-xl font-body-lg text-body-lg leading-relaxed text-text-muted ${hero.fade(240).className}`}
            style={hero.fade(240).style}
          >
            Soal template, pengisian data, pembayaran, atau undangan yang sudah tayang — hubungi
            kami lewat WhatsApp atau email.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-margin pb-space-2xl md:px-margin-tablet md:pb-space-3xl lg:px-margin-desktop">
        <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-lg bg-charcoal p-space-lg text-white shadow-xl transition-transform hover:scale-[1.01] md:p-space-xl"
          >
            <div>
              <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-wider text-soft-lime">
                PALING CEPAT
              </span>
              <h2 className="mt-space-sm font-headline-md text-headline-md tracking-tight">
                WhatsApp
              </h2>
              <p className="mt-space-xs font-body-md text-body-md text-white/70">
                {WHATSAPP_DISPLAY}
              </p>
            </div>
            <span className="mt-space-lg inline-flex items-center gap-2 self-start rounded-full bg-electric-lime px-6 py-3 font-label-btn text-label-btn text-charcoal">
              Chat sekarang
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </span>
          </a>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group flex flex-col justify-between rounded-lg bg-surface-card p-space-lg shadow-sm transition-shadow hover:shadow-md md:p-space-xl"
          >
            <div>
              <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-wider text-text-muted">
                EMAIL
              </span>
              <h2 className="mt-space-sm font-headline-md text-headline-md tracking-tight text-charcoal">
                Kirim email
              </h2>
              <p className="mt-space-xs break-all font-body-md text-body-md text-text-muted">
                {CONTACT_EMAIL}
              </p>
            </div>
            <span className="mt-space-lg inline-flex items-center gap-2 self-start rounded-full bg-surface-container px-6 py-3 font-label-btn text-label-btn text-charcoal">
              Tulis email
              <span className="material-symbols-outlined text-[18px]">mail</span>
            </span>
          </a>
        </div>

        <p className="mt-space-lg font-body-sm text-body-sm text-text-muted">
          Pertanyaan umum sudah kami jawab di{" "}
          <A className="font-semibold text-charcoal underline" href="/faq">
            halaman FAQ
          </A>
          .
        </p>
      </section>
    </main>
  );
}
