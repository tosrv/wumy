import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { checkIsAdmin } from "@/lib/admin";

export type AdminCheck = "checking" | "customer" | "admin";

/**
 * Admin accounts are separate from customer accounts and have no use for the customer
 * area (dashboard, editor, order), so they are sent to /admin. Returns "customer" once
 * the signed-in user is known not to be an admin; pages that create data (e.g. /order)
 * should wait for that before acting.
 */
export function useRedirectAdmins(): AdminCheck {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AdminCheck>("checking");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setState("customer");
      return;
    }
    let cancelled = false;
    void checkIsAdmin().then((isAdmin) => {
      if (cancelled) return;
      setState(isAdmin ? "admin" : "customer");
      if (isAdmin) void router.navigate({ to: "/admin", replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [loading, user, router]);

  return state;
}
