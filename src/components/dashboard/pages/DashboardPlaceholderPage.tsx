import { Link } from "@tanstack/react-router";

interface DashboardPlaceholderPageProps {
  title: string;
  description: string;
  cta?: { label: string; to: "/order" | "/dashboard" | "/product" };
}

export function DashboardPlaceholderPage({
  title,
  description,
  cta,
}: DashboardPlaceholderPageProps) {
  return (
    <main className="px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">Coming in a later phase.</p>
          {cta && (
            <Link
              to={cta.to}
              className="mt-4 inline-flex text-sm font-semibold text-foreground hover:text-muted-foreground"
            >
              {cta.label} →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
