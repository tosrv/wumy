import { Link } from "@tanstack/react-router";

type LegalSection = {
  heading: string;
  body: string;
};

type LegalPageProps = {
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
};

/** Shared layout for Privacy / Terms / Refund. */
export function LegalPage({ title, summary, updated, sections }: LegalPageProps) {
  return (
    <main className="w-full bg-surface-canvas pt-20">
      <div className="mx-auto max-w-[720px] px-margin py-space-2xl md:px-margin-tablet lg:px-margin-desktop md:py-space-3xl">
        <p className="font-label-eyebrow text-label-eyebrow uppercase tracking-widest text-text-muted">
          Legal · Diperbarui {updated}
        </p>
        <h1 className="mt-3 font-headline-xl text-headline-xl tracking-tight text-charcoal">
          {title}
        </h1>
        <p className="mt-4 font-body-lg text-body-lg text-text-muted leading-relaxed">
          {summary}
        </p>

        <div className="mt-space-2xl space-y-space-xl">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-headline-md text-headline-md text-charcoal tracking-tight">
                {section.heading}
              </h2>
              <p className="mt-3 font-body-md text-body-md text-text-muted leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-space-2xl font-body-sm text-body-sm text-text-muted">
          Ada pertanyaan?{" "}
          <Link
            to="/contact"
            className="font-semibold text-charcoal underline-offset-2 hover:underline"
          >
            Hubungi kami
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
