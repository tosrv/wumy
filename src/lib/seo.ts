import { DEFAULT_PUBLISH_PRICE_IDR } from "@/lib/pricing";

/**
 * Shared SEO helpers for marketing pages.
 * Set VITE_SITE_URL in production (e.g. https://wumy.id).
 */

export const SITE_NAME = "WUMY";
export const SITE_TAGLINE = "Undangan pernikahan digital, satu link untuk semua tamu.";

export function getSiteUrl(): string {
  const fromEnv = import.meta.env["VITE_SITE_URL"] as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return "https://www.wumy.my.id";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl(): string {
  return absoluteUrl("/og-image.png");
}

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  /** defaults to website */
  ogType?: string;
  /** noindex for app/auth stubs */
  noIndex?: boolean;
  image?: string;
};

export function buildPageHead({
  title,
  description,
  path,
  ogType = "website",
  noIndex = false,
  image = ogImageUrl(),
}: PageSeoInput) {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      ...(noIndex
        ? [{ name: "robots", content: "noindex, nofollow" as const }]
        : [{ name: "robots", content: "index, follow" as const }]),
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: ogType },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_TAGLINE,
    logo: absoluteUrl("/favicon.ico"),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description:
      "Buat undangan pernikahan digital tanpa ribet: pilih template, isi data, bagikan satu link.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description:
      "Undangan pernikahan digital: template, link personal tamu, dan RSVP dalam satu link.",
    offers: {
      "@type": "Offer",
      price: String(DEFAULT_PUBLISH_PRICE_IDR),
      priceCurrency: "IDR",
      description: "Bayar sekali, lalu isi dan terbitkan undanganmu.",
    },
    url: absoluteUrl("/product"),
  };
}
