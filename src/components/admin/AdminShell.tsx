import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronsUpDown, CreditCard, History, LogOut, Mail, Menu, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppBreakpoint } from "@/hooks/use-app-breakpoint";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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

/** Sidebar panel shared by the desktop layout and the tablet drawer. */
function AdminSidebar({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { email, initials } = useAdminUser();

  return (
    <Sidebar collapsible="none" className={cn("h-svh border-r border-sidebar-border", className)}>
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
  );
}

function DesktopShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen className="h-svh overflow-hidden">
      <AdminSidebar />
      <SidebarInset className="min-h-0 overflow-auto bg-background">
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AdminMark() {
  return (
    <Link
      to="/admin/invitations"
      className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight"
    >
      WUMY
      <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Admin
      </span>
    </Link>
  );
}

/** Tablet: the desktop sidebar in a drawer from the left, opened with the menu button. */
function TabletShell({ children }: { children: ReactNode }) {
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
            <AdminSidebar className="h-full w-full border-r-0" />
          </SheetContent>
        </Sheet>
        <AdminMark />
      </header>
      <div className="w-full flex-1">{children}</div>
    </SidebarProvider>
  );
}

/** Mobile: compact header and a bottom navigation bar, like the customer dashboard. */
function MobileShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { initials } = useAdminUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-12 items-center border-b border-border bg-background px-4">
        <AdminMark />
      </header>

      <div className="flex-1 pb-20">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-4 px-1">
          {adminNav.map((item) => {
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
                  <span>{item.label}</span>
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
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span>Account</span>
                </button>
              }
            />
          </li>
        </ul>
      </nav>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const breakpoint = useAppBreakpoint();
  if (breakpoint === "desktop") return <DesktopShell>{children}</DesktopShell>;
  if (breakpoint === "tablet") return <TabletShell>{children}</TabletShell>;
  return <MobileShell>{children}</MobileShell>;
}
