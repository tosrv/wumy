import { A } from "@/components/A";
import { landingTemplates } from "@/data/templates";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function scrollFade(visible: boolean, delayMs = 0) {
  return {
    className: `transition-[opacity,transform] duration-[1600ms] ease-out ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`,
    style: { transitionDelay: visible ? `${delayMs}ms` : "0ms" } as const,
  };
}

const cardClass =
  "group flex flex-col justify-between rounded-xl bg-surface-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30";

/** Landing showcase: real screenshots of each template's demo (public/templates/<id>.png). */
export function HomeTemplates() {
  const templatesReveal = useScrollReveal<HTMLElement>();

  return (
    <section className="w-full" id="templates" ref={templatesReveal.ref}>
      <div
        className={`mb-10 flex flex-col justify-between md:flex-row md:items-end ${scrollFade(templatesReveal.visible, 0).className}`}
        style={scrollFade(templatesReveal.visible, 0).style}
      >
        <div>
          <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-widest text-text-muted">
            TEMPLATE
          </span>
          <h2 className="mt-1 font-headline-xl text-headline-xl tracking-tight text-charcoal">
            Pilih gaya undanganmu.
          </h2>
          <p className="mt-2 font-body-lg text-body-lg text-text-muted">
            Buka demonya dulu — semua template punya demo.
          </p>
        </div>
        <A
          className="mt-4 inline-flex items-center gap-1 font-label-btn text-label-btn text-charcoal transition-colors hover:text-text-muted md:mt-0"
          href="/product"
        >
          Lihat semua template{" "}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </A>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {landingTemplates.map((tpl, i) => (
          <A
            key={tpl.id}
            href={`/demo/${tpl.id}`}
            className={`${cardClass} ${scrollFade(templatesReveal.visible, 150 * (i + 1)).className}`}
            style={scrollFade(templatesReveal.visible, 150 * (i + 1)).style}
            aria-label={`Buka demo template ${tpl.name}`}
          >
            <div>
              <div className="relative mb-5 aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-high transition-transform duration-300 group-hover:scale-[1.01]">
                <img
                  className="h-full w-full object-cover object-top"
                  src={`/templates/${tpl.id}.png`}
                  alt={`Tampilan template ${tpl.name}`}
                  width={390}
                  height={780}
                  loading="lazy"
                />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-charcoal">{tpl.name}</h3>
              <p className="mt-1 font-body-sm text-body-sm text-text-muted">{tpl.vibe}</p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 font-label-btn text-label-btn text-charcoal">
              Lihat demo{" "}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </span>
          </A>
        ))}
      </div>
    </section>
  );
}
