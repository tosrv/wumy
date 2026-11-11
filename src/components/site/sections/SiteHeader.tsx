import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/lib/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { label: "Beranda", to: "/" },
  { label: "Template", to: "/product" },
  { label: "FAQ", to: "/faq" },
  { label: "Kontak", to: "/contact" },
] as const;

export function SiteHeader() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const accountTo = !loading && user ? "/dashboard" : "/login";
  const accountLabel = !loading && user ? "Dashboard" : "Masuk";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-margin md:px-margin-tablet lg:px-margin-desktop">
        <BrandLogo />
        <nav className="hidden items-center gap-space-lg md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="text-body-sm font-body-sm text-text-muted transition-colors hover:text-on-surface"
              activeProps={{
                className: "text-body-sm font-body-sm font-semibold text-charcoal",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {!loading && (
            <Link
              to={accountTo}
              className="hidden text-body-sm font-body-sm font-semibold text-charcoal transition-colors hover:text-text-muted md:inline"
            >
              {accountLabel}
            </Link>
          )}
          <Link
            to="/order"
            className="hidden items-center justify-center rounded-full bg-electric-lime px-6 py-2.5 text-label-btn font-label-btn text-charcoal shadow-[0_2px_12px_rgba(212,249,50,0.35)] transition-all hover:brightness-105 md:inline-flex"
          >
            Pesan undangan
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-black/5 md:hidden"
                aria-label="Buka menu"
              >
                <Menu className="size-5" strokeWidth={2} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[min(100%,20rem)] flex-col gap-0 border-0 bg-surface-canvas p-0"
            >
              <SheetHeader className="border-b border-black/5 px-6 py-5 text-left">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <BrandLogo />
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: item.to === "/" }}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 text-base text-text-muted transition-colors hover:bg-black/[0.04] hover:text-on-surface"
                    activeProps={{
                      className:
                        "rounded-xl px-3 py-3 text-base font-semibold text-charcoal bg-black/[0.04]",
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3 border-t border-black/5 px-6 py-5">
                {!loading && (
                  <Link
                    to={accountTo}
                    onClick={() => setMobileOpen(false)}
                    className="text-center text-body-sm font-body-sm font-semibold text-charcoal"
                  >
                    {accountLabel}
                  </Link>
                )}
                <Link
                  to="/order"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center rounded-full bg-electric-lime px-6 py-3 text-label-btn font-label-btn text-charcoal shadow-[0_2px_12px_rgba(212,249,50,0.35)]"
                >
                  Pesan undangan
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
