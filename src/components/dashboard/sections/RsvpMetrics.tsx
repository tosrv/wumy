export type RsvpMetric = {
  label: string;
  value: number;
};

interface RsvpMetricsProps {
  metrics: RsvpMetric[];
}

export function RsvpMetrics({ metrics }: RsvpMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex flex-col justify-between gap-4 rounded-xl bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
          <span className="font-display text-4xl font-extrabold tracking-tight text-foreground">
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}
