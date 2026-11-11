import { useState } from "react";
import { A } from "@/components/A";
import type { CategoryId } from "@/data/templates";
import { invitationTemplates, templateCategories } from "@/data/templates";

const cardClass =
  "group flex flex-col justify-between rounded-xl bg-surface-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30";

type FilterId = "all" | CategoryId;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Semua" },
  ...templateCategories.map((c) => ({ id: c.id as FilterId, label: c.label })),
];

/** Template catalog with category filter; previews are real demo screenshots. */
export function ProductTemplateGrid() {
  const [filter, setFilter] = useState<FilterId>("all");
  const shown = invitationTemplates.filter((t) => filter === "all" || t.categoryId === filter);

  return (
    <>
      <section className="mx-auto mb-space-2xl w-full max-w-[1240px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-2xl bg-surface-card p-2.5 shadow-sm scrollbar-none">
          <div className="flex min-w-max items-center gap-1 sm:gap-2">
            {FILTERS.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={active}
                  className={
                    active
                      ? "flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 font-label-btn text-label-btn text-white shadow-sm transition-all"
                      : "flex items-center gap-2 rounded-full px-5 py-2.5 font-label-btn text-label-btn text-text-muted transition-all hover:bg-surface-container hover:text-charcoal"
                  }
                >
                  <span
                    className={`h-2 w-2 rounded-full ${active ? "bg-electric-lime" : "bg-transparent"}`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <span className="hidden shrink-0 rounded-full bg-surface-container px-2.5 py-1 font-label-eyebrow text-label-eyebrow font-bold text-charcoal md:inline">
            {shown.length} TEMPLATE
          </span>
        </div>
      </section>

      <section className="mx-auto mb-space-3xl w-full max-w-[1240px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((tpl) => (
            <A
              key={tpl.id}
              href={`/demo/${tpl.id}`}
              className={cardClass}
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
    </>
  );
}
