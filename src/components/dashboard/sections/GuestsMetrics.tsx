export type GuestMetric = {
  label: string;
  value: number | string;
};

interface GuestsMetricsProps {
  metrics: GuestMetric[];
}

export function GuestsMetrics({ metrics }: GuestsMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex flex-col justify-between rounded-xl bg-card p-6 shadow-sm"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {metric.label}
          </span>
          <span className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground">
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}
