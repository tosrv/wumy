import { useSyncExternalStore } from "react";

export type AppBreakpoint = "mobile" | "tablet" | "desktop";

const MOBILE_MQ = "(max-width: 767px)";
const TABLET_MQ = "(min-width: 768px) and (max-width: 1023px)";

function getBreakpoint(): AppBreakpoint {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia(MOBILE_MQ).matches) return "mobile";
  if (window.matchMedia(TABLET_MQ).matches) return "tablet";
  return "desktop";
}

function subscribe(onStoreChange: () => void) {
  const mobile = window.matchMedia(MOBILE_MQ);
  const tablet = window.matchMedia(TABLET_MQ);
  mobile.addEventListener("change", onStoreChange);
  tablet.addEventListener("change", onStoreChange);
  return () => {
    mobile.removeEventListener("change", onStoreChange);
    tablet.removeEventListener("change", onStoreChange);
  };
}

export function useAppBreakpoint(): AppBreakpoint {
  return useSyncExternalStore(subscribe, getBreakpoint, () => "desktop");
}
