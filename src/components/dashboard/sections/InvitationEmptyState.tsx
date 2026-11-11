import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InvitationEmptyStateProps {
  title?: string;
  description: string;
  /** Center card in the available vertical space (Invitation menu). */
  centered?: boolean;
  className?: string;
}

export function InvitationEmptyState({
  title = "No invitation yet",
  description,
  centered = false,
  className,
}: InvitationEmptyStateProps) {
  const card = (
    <div
      className={cn(
        "w-full max-w-xl rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm",
        className,
      )}
    >
      <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Button
        asChild
        className="mt-6 h-10 rounded-full bg-accent px-6 font-bold text-accent-foreground hover:bg-accent/90"
      >
        <Link to="/order">
          <Sparkles className="size-4" />
          Start create
        </Link>
      </Button>
    </div>
  );

  if (centered) {
    return (
      <div className="flex min-h-[calc(100svh-8rem)] flex-1 flex-col items-center justify-center px-4 py-8 md:px-8">
        {card}
      </div>
    );
  }

  return card;
}
