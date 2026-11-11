import { A } from "@/components/A";
import { useCtaMotion } from "@/hooks/usePageMotion";
import { orderPath } from "@/lib/urls";

export function ProductCta() {
  const cta = useCtaMotion();

  return (
    <section
      className="mx-auto w-full max-w-[1240px] px-margin pb-space-3xl md:px-margin-tablet lg:px-margin-desktop"
      ref={cta.ref}
    >
      <div className="relative w-full overflow-hidden rounded-3xl bg-electric-lime p-10 text-center text-charcoal shadow-xl md:p-14">
        <div className="pointer-events-none absolute -left-16 -top-16 h-60 w-60 rounded-full bg-white/20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-charcoal/5" />
        <div
          className={`relative z-10 mx-auto flex max-w-2xl flex-col items-center ${cta.fade(0).className}`}
          style={cta.fade(0).style}
        >
          <span className="mb-space-md inline-block rounded-full bg-charcoal px-3 py-1 font-label-eyebrow text-label-eyebrow uppercase tracking-wider text-white">
            Siap kapan saja
          </span>
          <h2 className="mb-space-sm font-headline-hero text-headline-hero leading-tight tracking-tight text-charcoal">
            Sudah ketemu gayanya?
          </h2>
          <p className="mb-space-xl max-w-lg font-body-xl text-body-xl font-medium text-charcoal/80">
            Pilih template, bayar sekali, isi datamu, lalu terbitkan. Tamu menerima link personal
            yang rapi.
          </p>

          <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
            <A
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-charcoal px-8 py-4 font-label-btn text-label-btn text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.02] hover:bg-pure-black active:scale-[0.98] sm:w-auto"
              data-path="order"
              href={orderPath()}
            >
              <span>Pesan undangan</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </A>
            <A
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-surface-card px-8 py-4 font-label-btn text-label-btn text-charcoal shadow-sm transition-all hover:bg-surface-card/90 sm:w-auto"
              data-path="faq"
              href="/faq"
            >
              <span>Lihat FAQ</span>
            </A>
          </div>
        </div>
      </div>
    </section>
  );
}
