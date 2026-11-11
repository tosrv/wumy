import { A } from "@/components/A";
import { BrandLogo } from "@/components/BrandLogo";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact";

/** Same primary pages as SiteHeader nav. */
const QUICK_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Template", href: "/product" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontak", href: "/contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="w-full bg-surface-canvas pt-space-3xl pb-space-2xl">
      <div className="max-w-[1240px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl mb-space-3xl">
          <div>
            <div className="flex items-center gap-space-sm mb-space-md">
              <BrandLogo />
            </div>
            <p className="font-body-md text-body-md text-text-muted leading-relaxed max-w-xs">
              Undangan pernikahan digital yang rapi, satu link untuk semua tamu.
            </p>
            <div className="mt-space-md flex flex-col gap-1 font-body-sm text-body-sm">
              <a
                className="font-semibold text-charcoal hover:underline"
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {WHATSAPP_DISPLAY}
              </a>
              <a className="text-text-muted hover:text-on-surface" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
          <div className="hidden lg:block"></div>
          <div>
            <p className="font-label-eyebrow text-label-eyebrow uppercase text-charcoal mb-space-lg">
              Menu
            </p>
            <ul className="space-y-space-sm font-body-sm text-body-sm">
              {QUICK_LINKS.map((item) => (
                <li key={item.href} className="list-none">
                  <A
                    className="text-text-muted hover:text-on-surface transition-colors"
                    href={item.href}
                  >
                    {item.label}
                  </A>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-label-eyebrow text-label-eyebrow uppercase text-charcoal mb-space-lg">
              Legal
            </p>
            <ul className="space-y-space-sm font-body-sm text-body-sm">
              <li className="list-none">
                <A
                  className="text-text-muted hover:text-on-surface transition-colors"
                  data-path="privacy-policy"
                  href="/privacy"
                >
                  Kebijakan Privasi
                </A>
              </li>
              <li className="list-none">
                <A
                  className="text-text-muted hover:text-on-surface transition-colors"
                  data-path="terms-of-service"
                  href="/terms"
                >
                  Syarat & Ketentuan
                </A>
              </li>
              <li className="list-none">
                <A
                  className="text-text-muted hover:text-on-surface transition-colors"
                  data-path="refund-policy"
                  href="/refund"
                >
                  Kebijakan Refund
                </A>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-text-muted">© 2026 WUMY. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-space-md"></div>
        </div>
      </div>
    </footer>
  );
}
