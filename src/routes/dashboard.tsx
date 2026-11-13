import { useEffect, type ReactNode } from "react";
import { Outlet, createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/lib/auth";
import { useRedirectAdmins } from "@/hooks/use-admin-redirect";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  head: () =>
    buildPageHead({
      title: "Dashboard",
      description: "Manage your WUMY wedding invitations.",
      path: "/dashboard",
      noIndex: true,
    }),
});

function DashboardLayout() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  useRedirectAdmins();

  useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user) {
      void router.navigate({
        to: "/login",
        search: { next: "/dashboard" },
      });
    }
  }, [loading, configured, user, router]);

  if (!configured) {
    return (
      <DashboardShell title="Dashboard">
        <CenteredMessage
          title="Supabase required"
          body="Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use the dashboard."
          action={
            <Link to="/login" className="text-sm font-semibold underline">
              Back to login
            </Link>
          }
        />
      </DashboardShell>
    );
  }

  if (loading || !user) {
    return (
      <DashboardShell title="Dashboard">
        <CenteredMessage title="Loading…" body="Checking your session." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}

function CenteredMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </main>
  );
}
