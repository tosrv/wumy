import type { ComponentType, ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronsUpDown, CreditCard, History, LogOut, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppBreakpoint } from "@/hooks/use-app-breakpoint";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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

const adminNav: {
  label: string;
  to: "/admin/invitations" | "/admin/payments" | "/admin/activity";
  icon: ComponentType<{ className?: string }>;
}[] = [
  { label: "Invitations", to: "/admin/invitations", icon: Mail },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Activity", to: "/admin/activity", icon: History },
];

function isActivePath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function useAdminUser() {
  const { user } = useAuth();
  const email = user?.email ?? "";
  const initials = (email[0] ?? "A").toUpperCase();
  return { email, initials };
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
  const { email, initials } = useAdminUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 rounded-lg" side={side} align="end" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Admin</span>
              {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void (async () => {
              await signOut();
              void router.navigate({ to: "/login" });
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

function DesktopShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { email, initials } = useAdminUser();

  return (
    <SidebarProvider defaultOpen className="h-svh overflow-hidden">
      <Sidebar collapsible="none" className="h-svh border-r border-sidebar-border">
        <SidebarHeader className="gap-3 px-3 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="h-auto py-2">
                <Link to="/admin/invitations">
                  <div className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="font-display text-lg font-bold tracking-tight">WUMY</span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <ShieldCheck className="size-3" />
                      Admin
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => {
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
                          {active && <span className="ml-auto size-1.5 rounded-full bg-accent" />}
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
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Admin</span>
                      {email && (
                        <span className="truncate text-xs text-muted-foreground">{email}</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-0 overflow-auto bg-background">
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/** Tablet and mobile: top bar with the same three sections. */
function CompactShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { initials } = useAdminUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link
            to="/admin/invitations"
            className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight"
          >
            WUMY
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {adminNav.map((item) => {
              const active = isActivePath(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <AccountMenu
            side="bottom"
            trigger={
              <Button variant="ghost" size="icon" className="rounded-lg">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Account</span>
              </Button>
            }
          />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const breakpoint = useAppBreakpoint();
  if (breakpoint === "desktop") return <DesktopShell>{children}</DesktopShell>;
  return <CompactShell>{children}</CompactShell>;
}
