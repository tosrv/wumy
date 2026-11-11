import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/site/pages/ContactPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/contact")({
  component: ContactPage,
  head: () =>
    buildPageHead({
      title: "Kontak",
      description:
        "Pertanyaan soal undangan pernikahan digital WUMY? Hubungi kami lewat WhatsApp atau email.",
      path: "/contact",
    }),
});
