import { useHeroMotion } from "@/hooks/usePageMotion";
import { ProductTemplateGrid } from "@/components/site/sections/ProductTemplateGrid";
import { ProductCta } from "@/components/site/sections/ProductCta";
import { A } from "@/components/A";
import { orderPath } from "@/lib/urls";
import { formatIdr } from "@/lib/pricing";

export function ProductPage({ priceIdr }: { priceIdr: number }) {
  const hero = useHeroMotion();
  const priceLabel = formatIdr(priceIdr);

  return (
    <main className="w-full bg-surface-canvas pt-20">
      <div className="flex w-full flex-col">
        <section className="mx-auto w-full max-w-[1240px] px-margin pb-space-2xl pt-space-xl md:px-margin-tablet lg:px-margin-desktop">
          <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
            <div className="flex flex-col items-start lg:col-span-6">
              <div
                className={`mb-space-md inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-charcoal shadow-sm ${hero.fade(0).className}`}
                style={hero.fade(0).style}
              >
                <span className="h-2 w-2 rounded-full bg-electric-lime"></span>
                <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-wider text-charcoal">
                  Koleksi Template
                </span>
              </div>
              <h1
                className={`mb-space-md max-w-lg font-headline-hero text-headline-hero tracking-tight text-charcoal ${hero.fade(120).className}`}
                style={hero.fade(120).style}
              >
                Temukan gaya yang paling “kamu”.
              </h1>
              <p
                className={`mb-space-xl max-w-md font-body-xl text-body-xl leading-relaxed text-text-muted ${hero.fade(240).className}`}
                style={hero.fade(240).style}
              >
                Buka demo setiap template dulu. Bayar sekali{" "}
                <strong className="text-charcoal">{priceLabel}</strong>, lalu isi undanganmu
                sepuasnya — tanpa langganan.
              </p>
              <div
                className={`flex flex-wrap items-center gap-3 ${hero.fade(300).className}`}
                style={hero.fade(300).style}
              >
                <A
                  className="inline-flex items-center gap-2 rounded-full bg-electric-lime px-7 py-3.5 font-label-btn text-label-btn text-charcoal shadow-md transition-all hover:scale-[1.02] hover:brightness-105"
                  data-path="order"
                  href={orderPath()}
                >
                  Pesan undangan
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </A>
                <A
                  className="inline-flex items-center gap-2 rounded-full bg-surface-card px-6 py-3.5 font-label-btn text-label-btn text-charcoal shadow-sm transition-colors hover:bg-surface-container"
                  href="#templates"
                >
                  Lihat template
                </A>
              </div>
            </div>

            <div
              className={`relative flex items-center justify-center py-6 lg:col-span-6 ${hero.fade(280).className}`}
              style={hero.fade(280).style}
            >
              <div className="relative flex h-[380px] w-full max-w-[460px] items-center justify-center md:h-[440px]">
                <img
                  className="absolute left-2 top-6 h-80 w-auto rotate-[-6deg] rounded-2xl shadow-xl md:h-96"
                  src="/templates/romantic.png"
                  alt="Template Romantic"
                  width={390}
                  height={780}
                />
                <img
                  className="absolute bottom-2 right-2 z-10 h-80 w-auto rotate-[4deg] rounded-2xl shadow-2xl md:h-96"
                  src="/templates/modern.png"
                  alt="Template Modern"
                  width={390}
                  height={780}
                />
              </div>
            </div>
          </div>
        </section>
        <div id="templates">
          <ProductTemplateGrid />
        </div>
        <ProductCta />
      </div>
    </main>
  );
}
