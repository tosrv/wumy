import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "How do I publish my invitation?",
    a: "Finish your invitation details, then click Publish. Unpaid invites open a one-time checkout (manual for now). After payment, your public /{slug} link goes live.",
  },
  {
    q: "Can guests RSVP without an account?",
    a: "Yes. Guests open your public link, leave their name, attendance, and a message — no login required.",
  },
  {
    q: "How do personalized guest links work?",
    a: "Add guests in Guest List, then share each personalized `wumy.id/...` link. Responses show up in RSVP.",
  },
  {
    q: "Where can I see payment invoices?",
    a: "Open Billing for payment status, Pay buttons, and transaction history. Each successful checkout appears as a manual payment row.",
  },
];

const topics = [
  {
    title: "Getting started",
    description: "Create, edit, and preview your invitation.",
    icon: BookOpen,
  },
  {
    title: "Guests & RSVP",
    description: "Manage guest lists, links, and responses.",
    icon: MessageCircle,
  },
  {
    title: "Account & billing",
    description: "Profile, password, and payment questions.",
    icon: LifeBuoy,
  },
];

export function HelpPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 pb-16 md:px-8 md:py-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Help Center
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Quick answers for invitations, guests, RSVP, and your account —
              plus a direct line to support.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl bg-card shadow-sm"
            >
              <Link to="/faq">
                <HelpCircle className="size-4" />
                Full FAQ
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-xl bg-accent font-bold text-accent-foreground shadow-sm hover:bg-accent/90"
            >
              <Link to="/contact">
                <Mail className="size-4" />
                Contact CS
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="rounded-xl bg-card p-6 shadow-sm"
            >
              <topic.icon className="size-5 text-muted-foreground" />
              <h2 className="mt-4 text-base font-semibold tracking-tight">
                {topic.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {topic.description}
              </p>
            </div>
          ))}
        </div>

        <section className="rounded-xl bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">
            Frequently asked
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Common questions from couples using WUMY.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-xl bg-secondary/50 px-4 py-4"
              >
                <p className="font-semibold text-foreground">{item.q}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-xl bg-card p-6 shadow-sm">
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent/20 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Still need help?
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Reach customer support for account, publish, or payment issues.
                We usually reply within one business day.
              </p>
            </div>
            <Button
              asChild
              className="h-10 shrink-0 rounded-xl bg-accent font-bold text-accent-foreground shadow-sm hover:bg-accent/90"
            >
              <Link to="/contact">Message support</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
