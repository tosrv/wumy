export type OverviewMetric = {
  label: string;
  value: number | string;
};

interface OverviewMetricsProps {
  metrics: OverviewMetric[];
}

export function OverviewMetrics({ metrics }: OverviewMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex flex-col justify-center gap-2 rounded-xl bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {metric.label}
          </span>
          <span className="font-display text-4xl font-extrabold tracking-tight text-foreground">
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}
