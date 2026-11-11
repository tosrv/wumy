interface OverviewRsvpDistributionProps {
  attending: number;
  pending: number;
  declined: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 50; // ~314.16

export function OverviewRsvpDistribution({
  attending,
  pending,
  declined,
}: OverviewRsvpDistributionProps) {
  const total = attending + pending + declined;
  const pct = (value: number) =>
    total === 0 ? 0 : Math.round((value / total) * 100);

  const attendingLen = total === 0 ? 0 : (attending / total) * CIRCUMFERENCE;
  const pendingLen = total === 0 ? 0 : (pending / total) * CIRCUMFERENCE;
  const declinedLen = total === 0 ? 0 : (declined / total) * CIRCUMFERENCE;

  return (
    <section className="rounded-xl bg-card p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold tracking-tight text-foreground">
        RSVP Distribution
      </h2>
      <p className="mb-4 text-[13px] text-muted-foreground">
        Overview of response status
      </p>

      <div className="relative my-2 flex items-center justify-center">
        {total === 0 ? (
          <div className="flex size-44 items-center justify-center rounded-full border border-dashed border-border">
            <p className="px-6 text-center text-sm text-muted-foreground">
              No responses yet
            </p>
          </div>
        ) : (
          <>
            <svg className="size-44 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="oklch(0.94 0.01 95)"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="oklch(0.93 0.24 125)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${attendingLen} ${CIRCUMFERENCE}`}
                strokeDashoffset={0}
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="oklch(0.18 0 0)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${pendingLen} ${CIRCUMFERENCE}`}
                strokeDashoffset={-attendingLen}
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="oklch(0.8 0.02 110)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${declinedLen} ${CIRCUMFERENCE}`}
                strokeDashoffset={-(attendingLen + pendingLen)}
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-extrabold tracking-tight">
                {attending}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Attending
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {[
          {
            label: "Attending",
            value: attending,
            percent: pct(attending),
            swatch: "bg-accent",
          },
          {
            label: "Awaiting Reply",
            value: pending,
            percent: pct(pending),
            swatch: "bg-foreground",
          },
          {
            label: "Unable to Attend",
            value: declined,
            percent: pct(declined),
            swatch: "bg-[oklch(0.8_0.02_110)]",
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg bg-background p-2 transition-colors hover:bg-secondary/50"
          >
            <div className="flex items-center gap-2">
              <span className={`size-3 rounded-full ${row.swatch}`} />
              <span className="text-xs font-semibold text-foreground">
                {row.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-muted-foreground">
                {row.value} pax
              </span>
              <span className="text-xs font-semibold text-foreground">
                {row.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
