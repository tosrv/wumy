import type { ComponentType, ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  ClipboardList,
  CreditCard,
  ExternalLink,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { daysUntilWedding, listMyInvitations, type InvitationRow } from "@/lib/invitations";
import { useAppBreakpoint } from "@/hooks/use-app-breakpoint";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const primaryNav: {
  label: string;
  shortLabel: string;
  to: "/dashboard" | "/dashboard/guests" | "/dashboard/rsvp" | "/dashboard/invitation";
  icon: ComponentType<{ className?: string }>;
  externalHint?: boolean;
}[] = [
  {
    label: "Overview",
    shortLabel: "Home",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Guest List",
    shortLabel: "Guests",
    to: "/dashboard/guests",
    icon: Users,
  },
  {
    label: "RSVP",
    shortLabel: "RSVP",
    to: "/dashboard/rsvp",
    icon: ClipboardList,
  },
  {
    label: "Invitation",
    shortLabel: "Invite",
    to: "/dashboard/invitation",
    icon: Mail,
    externalHint: true,
  },
];

interface DashboardShellProps {
  children: ReactNode;
  title?: string;
}

function isActivePath(pathname: string, to: string) {
  if (to === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  if (to === "/dashboard/invitation") {
    return pathname.startsWith("/dashboard/invitation") || pathname.startsWith("/editor");
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function useUserDisplay() {
  const { user } = useAuth();
  const displayName =
    (user?.user_metadata?.["full_name"] as string | undefined)?.trim() ||
    user?.email?.split("@")[0] ||
    "Account";
  const email = user?.email ?? "";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return { displayName, email, initials };
}

function AccountMenu({
  side = "right",
  trigger,
}: {
  side?: "top" | "right" | "bottom" | "left";
  trigger: ReactNode;
}) {
  const { signOut } = useAuth();
  const router = useRouter();
  const { displayName, email, initials } = useUserDisplay();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 rounded-lg" side={side} align="end" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayName}</span>
              {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/dashboard/settings">
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard/billing">
              <CreditCard />
              Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard/help">
              <HelpCircle />
              Help Center
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void (async () => {
              await signOut();
              void router.navigate({ to: "/" });
            })();
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNavUser() {
  const { displayName, email, initials } = useUserDisplay();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AccountMenu
          side="right"
          trigger={
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** Sidebar panel shared by the desktop layout and the tablet drawer. */
function DashboardSidebar({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, configured } = useAuth();
  const [activeInvitation, setActiveInvitation] = useState<InvitationRow | null>(null);

  useEffect(() => {
    if (!user || !configured) return;
    let cancelled = false;
    listMyInvitations()
      .then((rows) => {
        if (!cancelled) setActiveInvitation(rows[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setActiveInvitation(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user, configured]);

  const coupleLabel = activeInvitation
    ? `${activeInvitation.partner_a_name} & ${activeInvitation.partner_b_name}`
    : "Your wedding";
  const daysLeft = daysUntilWedding(activeInvitation?.wedding_date ?? null);

  return (
    <Sidebar collapsible="none" className={cn("h-svh border-r border-sidebar-border", className)}>
      <SidebarHeader className="gap-3 px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-auto py-2">
              <Link to="/dashboard">
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="font-display text-lg font-bold tracking-tight">WUMY</span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Wedding Space
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {activeInvitation && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/60 px-2.5 py-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Heart className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-semibold text-foreground">{coupleLabel}</span>
            </div>
            {daysLeft != null && daysLeft >= 0 && (
              <span className="shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                {daysLeft}d left
              </span>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => {
                const active = isActivePath(pathname, item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn("rounded-lg", active && "bg-secondary font-semibold")}
                    >
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                        {active ? (
                          <span className="ml-auto size-1.5 rounded-full bg-accent" />
                        ) : item.externalHint ? (
                          <ExternalLink className="ml-auto size-3.5 opacity-50" />
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function DesktopShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen className="h-svh overflow-hidden">
      <DashboardSidebar />
      <SidebarInset className="min-h-0 overflow-auto bg-background">
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/** Tablet: the desktop sidebar in a drawer from the left, opened with the menu button. */
function TabletShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  // Close the drawer after navigating.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <SidebarProvider defaultOpen className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 sm:max-w-72 [&>button]:hidden">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <DashboardSidebar className="h-full w-full border-r-0" />
          </SheetContent>
        </Sheet>
        <Link to="/dashboard" className="font-display text-lg font-bold tracking-tight">
          WUMY
        </Link>
        {title && <p className="ml-auto truncate text-sm text-muted-foreground">{title}</p>}
      </header>
      <div className="w-full flex-1">{children}</div>
    </SidebarProvider>
  );
}

function MobileShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { initials } = useUserDisplay();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-background px-4">
        <Link to="/dashboard" className="font-display text-base font-bold tracking-tight">
          WUMY
        </Link>
        {title && <p className="truncate text-sm text-muted-foreground">{title}</p>}
      </header>

      <div className="flex-1 pb-20">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
          {primaryNav.map((item) => {
            const active = isActivePath(pathname, item.to);
            return (
              <li key={item.to} className="flex">
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <item.icon className={cn("size-5", active && "text-foreground")} />
                  <span>{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex">
            <AccountMenu
              side="top"
              trigger={
                <button
                  type="button"
                  className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  <Avatar className="h-5 w-5 rounded-full">
                    <AvatarFallback className="rounded-full text-[9px] font-bold">
                      {initials || <MoreHorizontal className="size-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <span>More</span>
                </button>
              }
            />
          </li>
        </ul>
      </nav>
    </div>
  );
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  const breakpoint = useAppBreakpoint();

  if (breakpoint === "desktop") {
    return <DesktopShell>{children}</DesktopShell>;
  }

  if (breakpoint === "tablet") {
    return <TabletShell {...(title ? { title } : {})}>{children}</TabletShell>;
  }

  return <MobileShell {...(title ? { title } : {})}>{children}</MobileShell>;
}
