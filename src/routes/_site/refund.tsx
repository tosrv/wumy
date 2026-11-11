import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/pages/LegalPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/refund")({
  component: RefundPage,
  head: () =>
    buildPageHead({
      title: "Kebijakan Refund",
      description: "Kapan pembayaran undangan WUMY dapat dikembalikan.",
      path: "/refund",
    }),
});

function RefundPage() {
  return (
    <LegalPage
      title="Kebijakan Refund"
      summary="Refund penuh selama undangan belum pernah tayang dan belum lewat 7 hari sejak pembayaran."
      updated="November 2026"
      sections={[
        {
          heading: "Kapan refund diberikan",
          body: "Refund penuh selama undangan belum pernah tayang, paling lambat 7 hari setelah pembayaran, apa pun alasannya. Kendala teknis dari pihak WUMY yang tidak bisa kami perbaiki dalam 3 hari kerja juga dapat di-refund penuh.",
        },
        {
          heading: "Kapan refund tidak diberikan",
          body: "Setelah undangan pernah tayang, atau lebih dari 7 hari sejak pembayaran (kecuali kendala teknis dari pihak WUMY).",
        },
        {
          heading: "Cara mengajukan",
          body: "Hubungi kami lewat WhatsApp atau email dengan menyertakan email akun dan nomor invoice. Refund yang disetujui dikembalikan melalui DOKU atau transfer bank, biasanya dalam 7 hari kerja.",
        },
        {
          heading: "Pembayaran ganda",
          body: "Jika kamu tidak sengaja membayar lebih dari sekali untuk undangan yang sama, pembayaran tambahan akan dikembalikan penuh.",
        },
      ]}
    />
  );
}
