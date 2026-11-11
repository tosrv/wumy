import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Eye, Share2, Sparkles } from "lucide-react";
import { formatWeddingDate, type InvitationRow } from "@/lib/invitations";
import { invitationPublicUrl } from "@/lib/urls";
import { Button } from "@/components/ui/button";

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface OverviewGreetingProps {
  invitation: InvitationRow | null;
  coupleLabel: string;
}

export function OverviewGreeting({ invitation, coupleLabel }: OverviewGreetingProps) {
  const dateLabel = invitation ? formatWeddingDate(invitation.wedding_date) : null;

  return (
    <div className="flex flex-col gap-3 pb-1 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {greetingForNow()}, {coupleLabel}
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {invitation ? (
            <>
              Here is the latest pulse of your celebration
              {dateLabel ? (
                <>
                  {" "}
                  scheduled for <span className="font-semibold text-foreground">{dateLabel}</span>
                </>
              ) : null}
              .
            </>
          ) : (
            "Create your first invitation to see celebration insights here."
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
        {invitation ? (
          <>
            <Button variant="outline" className="h-10 rounded-xl bg-card shadow-sm" asChild>
              {invitation.status === "published" && invitation.payment_status === "paid" ? (
                <Link to="/$slug" params={{ slug: invitation.slug }}>
                  <Eye className="size-4" />
                  Preview Live Site
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </Link>
              ) : (
                <Link to="/demo/$templateId" params={{ templateId: invitation.template_id }}>
                  <Eye className="size-4" />
                  Preview template
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </Link>
              )}
            </Button>
            <Button
              className="h-10 rounded-xl bg-accent text-accent-foreground shadow-sm hover:bg-accent/90"
              type="button"
              onClick={() => {
                const url = invitationPublicUrl(invitation.slug);
                if (navigator.share) {
                  void navigator.share({
                    title: `${coupleLabel} Wedding Invitation`,
                    url,
                  });
                } else {
                  void navigator.clipboard.writeText(url);
                }
              }}
            >
              <Share2 className="size-4" />
              Share Invitation
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
