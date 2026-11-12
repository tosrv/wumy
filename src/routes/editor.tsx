import { useEffect, type ReactNode } from "react";
import { Outlet, createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useRedirectAdmins } from "@/hooks/use-admin-redirect";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/editor")({
  component: EditorLayout,
  head: () =>
    buildPageHead({
      title: "Invitation Editor",
      description: "Edit your WUMY wedding invitation.",
      path: "/editor",
      noIndex: true,
    }),
});

function EditorLayout() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  useRedirectAdmins();

  useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user) {
      void router.navigate({
        to: "/login",
        search: { next: "/editor" },
      });
    }
  }, [loading, configured, user, router]);

  if (!configured) {
    return (
      <CenteredMessage
        title="Supabase required"
        body="Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use the editor."
        action={
          <Link to="/login" className="text-sm font-semibold underline">
            Back to login
          </Link>
        }
      />
    );
  }

  if (loading || !user) {
    return <CenteredMessage title="Loading…" body="Checking your session." />;
  }

  return <Outlet />;
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
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </main>
  );
}
