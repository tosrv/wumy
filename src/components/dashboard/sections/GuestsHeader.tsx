import { Link } from "@tanstack/react-router";
import { Sparkles, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuestsHeaderProps {
  total: number;
  responded: number;
  pending: number;
  linksOpened: number;
  hasInvitation: boolean;
  onImport?: () => void;
  onAdd: () => void;
}

export function GuestsHeader({
  total,
  responded,
  pending,
  linksOpened,
  hasInvitation,
  onImport,
  onAdd,
}: GuestsHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Guest List
          </h1>
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-bold text-accent-foreground">
            {total} Total
          </span>
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block size-2 rounded-full bg-[oklch(0.45_0.1_160)]" />
          <span>{responded} responded</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-block size-2 rounded-full bg-muted-foreground" />
          <span>{pending} pending</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-block size-2 rounded-full bg-accent" />
          <span>{linksOpened} links opened</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
        {hasInvitation ? (
          <>
            <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={onImport}>
              <Upload className="size-4 text-muted-foreground" />
              Import CSV
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-accent font-bold text-accent-foreground shadow-sm hover:bg-accent/90"
              onClick={onAdd}
            >
              <UserPlus className="size-4" />+ Add Guest
            </Button>
          </>
        ) : (
          <Button
            className="h-10 rounded-xl bg-accent text-accent-foreground shadow-sm hover:bg-accent/90"
            asChild
          >
            <Link to="/order">
              <Sparkles className="size-4" />
              Create invitation
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
