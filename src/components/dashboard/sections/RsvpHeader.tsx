import { Link } from "@tanstack/react-router";
import { Download, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RsvpHeaderProps {
  attending: number;
  replied: number;
  total: number;
  hasInvitation: boolean;
  onExport: () => void;
}

export function RsvpHeader({
  attending,
  replied,
  total,
  hasInvitation,
  onExport,
}: RsvpHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            RSVP Responses
          </h1>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground shadow-sm">
            <UserCheck className="size-4" />
            {attending} Attending
          </div>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {replied} / {total} Replied
          </span>
        </div>
        <p className="max-w-2xl text-base text-muted-foreground">
          Real-time attendance responses and blessings from your wedding invitation guests.
        </p>
      </div>

      {hasInvitation ? (
        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 self-start rounded-xl bg-card shadow-sm lg:self-auto"
          onClick={onExport}
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      ) : (
        <Button
          className="h-10 shrink-0 self-start rounded-xl bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 lg:self-auto"
          asChild
        >
          <Link to="/order">
            <Sparkles className="size-4" />
            Create invitation
          </Link>
        </Button>
      )}
    </div>
  );
}
