import { useEffect, useState } from "react";
import { A } from "@/components/A";
import { PhoneStatusBar } from "@/components/PhoneStatusBar";

export function HomeHero({ priceLabel }: { priceLabel: string }) {
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setHeroReady(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setHeroReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const fadeUp = (delayMs: number) => ({
    className: `transition-all duration-1000 ease-out ${
      heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`,
    style: { transitionDelay: heroReady ? `${delayMs}ms` : "0ms" } as const,
  });

  return (
    <section className="w-full relative overflow-hidden rounded-xl bg-surface-card p-8 md:p-14 lg:p-20 shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        <div className="lg:col-span-6 flex flex-col items-start">
          <span
            className={`${fadeUp(0).className} inline-block font-label-eyebrow text-label-eyebrow tracking-widest text-text-muted uppercase mb-4`}
            style={fadeUp(0).style}
          >
            UNDANGAN PERNIKAHAN DIGITAL
          </span>
          <h1
            className={`${fadeUp(120).className} font-headline-hero text-headline-hero text-charcoal tracking-tighter leading-[0.95] mb-6`}
            style={fadeUp(120).style}
          >
            Satu link,
            <br />
            <span className="underline decoration-electric-lime decoration-[6px] underline-offset-4">
              semua tamu
            </span>
            <br />
            datang.
          </h1>
          <p
            className={`${fadeUp(240).className} font-body-lg text-body-lg text-text-muted max-w-md mb-8 leading-relaxed`}
            style={fadeUp(240).style}
          >
            Pilih template, bayar, isi data pernikahan dengan pratinjau langsung, lalu terbitkan dan
            bagikan lewat WhatsApp. Lengkap dengan RSVP, peta, hadiah digital, dan musik.
          </p>
          <div
            className={`${fadeUp(360).className} flex flex-wrap items-center gap-5`}
            style={fadeUp(360).style}
          >
            <A
              className="inline-flex items-center gap-2 bg-electric-lime text-charcoal font-label-btn text-label-btn px-8 py-4 rounded-full shadow-md hover:scale-[1.02] hover:bg-soft-lime transition-all duration-200"
              data-path="order"
              href="/order"
            >
              Pesan undangan{" "}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </A>
            <A
              className="inline-flex items-center gap-1 font-label-btn text-label-btn text-charcoal hover:text-text-muted transition-colors px-4 py-2"
              href="#templates"
            >
              Lihat template{" "}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </A>
          </div>
          <div
            className={`${fadeUp(480).className} mt-12 pt-8 flex items-center gap-6`}
            style={fadeUp(480).style}
          >
            <p className="font-body-sm text-body-sm text-text-muted">
              Bayar sekali <strong className="text-charcoal">{priceLabel}</strong>, lalu isi
              undanganmu sepuasnya — tanpa langganan.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 relative flex justify-center items-center py-8 md:py-10">
          {/* Shadow device — same phone proportions */}
          <div
            className={`absolute w-[240px] sm:w-[260px] md:w-[280px] aspect-[9/18] bg-secondary-fixed rounded-[2.6rem] scale-[0.96] translate-x-3 shadow-md transition-all duration-1000 ease-out ${
              heroReady ? "translate-y-2 opacity-55" : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: heroReady ? "200ms" : "0ms" }}
            aria-hidden="true"
          />

          {/* Phone frame */}
          <div
            className={`relative w-[240px] sm:w-[260px] md:w-[280px] aspect-[9/18] rounded-[2.6rem] bg-pure-black p-[9px] shadow-2xl z-20 transition-all duration-1000 ease-out ${
              heroReady ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: heroReady ? "320ms" : "0ms" }}
          >
            {/* Dynamic Island */}
            <div className="absolute top-[14px] left-1/2 -translate-x-1/2 z-30 w-[78px] h-[22px] bg-pure-black rounded-full pointer-events-none" />
            <PhoneStatusBar />

            <div className="w-full h-full bg-surface-card rounded-[2.1rem] overflow-hidden">
              <img
                className="w-full h-full object-cover object-top"
                alt="Contoh undangan WUMY dengan template Minimal"
                src="/templates/minimal.png"
                width={390}
                height={780}
              />
            </div>
          </div>

          <div
            className={`absolute -bottom-3 right-2 md:right-6 bg-surface-card rounded-2xl p-3.5 shadow-xl z-30 flex items-center gap-3 transition-all duration-1000 ease-out ${
              heroReady ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: heroReady ? "520ms" : "0ms" }}
          >
            <div className="w-9 h-9 rounded-full bg-electric-lime flex items-center justify-center text-charcoal shrink-0">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            </div>
            <div>
              <p className="font-label-eyebrow text-[9px] text-text-muted uppercase">
                Siap dibagikan
              </p>
              <p className="font-headline-sm text-[13px] text-charcoal">Link WhatsApp aktif</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
