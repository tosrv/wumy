import { useMemo, useState } from "react";
import { A } from "@/components/A";
import { useHeroMotion } from "@/hooks/usePageMotion";
import { whatsappUrl } from "@/lib/contact";
import { faqItems } from "@/lib/faq-data";
import { formatIdr } from "@/lib/pricing";

export function FaqPage({ priceIdr }: { priceIdr: number }) {
  const hero = useHeroMotion();
  const [query, setQuery] = useState("");
  const items = useMemo(() => faqItems(formatIdr(priceIdr)), [priceIdr]);
  const q = query.trim().toLowerCase();
  const shown = q
    ? items.filter((i) => `${i.question} ${i.answer}`.toLowerCase().includes(q))
    : items;

  return (
    <main className="w-full bg-surface-canvas pt-20">
      <section className="mx-auto max-w-[880px] px-margin pb-space-lg pt-space-xl md:px-margin-tablet md:pt-space-2xl">
        <h1
          className={`font-headline-xl text-headline-xl tracking-tight text-charcoal md:text-headline-hero ${hero.fade(0).className}`}
          style={hero.fade(0).style}
        >
          Pertanyaan yang sering ditanyakan
        </h1>
        <div className={`mt-space-lg ${hero.fade(120).className}`} style={hero.fade(120).style}>
          <label htmlFor="faq-search" className="sr-only">
            Cari pertanyaan
          </label>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari: harga, RSVP, foto, refund…"
            className="h-12 w-full rounded-full bg-surface-card px-5 font-body-md text-body-md text-charcoal shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[880px] px-margin pb-space-2xl md:px-margin-tablet">
        {shown.length === 0 ? (
          <p className="rounded-xl bg-surface-card p-space-lg font-body-md text-body-md text-text-muted shadow-sm">
            Tidak ada hasil untuk “{query}”. Coba kata lain, atau{" "}
            <a
              className="font-semibold text-charcoal underline"
              href={whatsappUrl(`Halo WUMY, saya mau tanya: ${query}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              tanya kami via WhatsApp
            </a>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl bg-surface-card p-5 shadow-sm open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-headline-sm text-headline-sm text-charcoal">
                  {item.question}
                  <span className="material-symbols-outlined shrink-0 text-[22px] transition-transform group-open:rotate-45">
                    add
                  </span>
                </summary>
                <p className="mt-3 font-body-md text-body-md leading-relaxed text-text-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        )}

        <div className="mt-space-xl flex flex-col items-start gap-4 rounded-xl bg-charcoal p-space-lg text-white sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body-lg text-body-lg">Masih ada pertanyaan?</p>
          <div className="flex flex-wrap gap-3">
            <a
              className="rounded-full bg-electric-lime px-6 py-3 font-label-btn text-label-btn text-charcoal"
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat WhatsApp
            </a>
            <A
              className="rounded-full bg-white/10 px-6 py-3 font-label-btn text-label-btn text-white"
              href="/order"
            >
              Pesan undangan
            </A>
          </div>
        </div>
      </section>
    </main>
  );
}
