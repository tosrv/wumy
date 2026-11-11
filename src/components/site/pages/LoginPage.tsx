import { getRouteApi } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/sections/AuthForm";

const routeApi = getRouteApi("/_site/login");

export function LoginPage() {
  const { next, mode } = routeApi.useSearch();
  return (
    <main className="w-full pt-20 bg-surface-canvas">
      <AuthForm initialMode={mode ?? "login"} nextPath={next ?? "/dashboard"} />
    </main>
  );
}
