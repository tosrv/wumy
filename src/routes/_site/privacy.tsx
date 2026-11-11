import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/pages/LegalPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/privacy")({
  component: PrivacyPage,
  head: () =>
    buildPageHead({
      title: "Kebijakan Privasi",
      description: "Data apa yang dikumpulkan WUMY dan bagaimana data itu digunakan.",
      path: "/privacy",
    }),
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Kebijakan Privasi"
      summary="Kami hanya mengumpulkan data yang diperlukan untuk menjalankan undanganmu."
      updated="November 2026"
      sections={[
        {
          heading: "Data yang kami simpan",
          body: "Data akun (nama, email), isi undangan (nama mempelai dan keluarga, jadwal acara, informasi hadiah digital, foto, musik), daftar tamu yang kamu buat, serta RSVP dan ucapan yang dikirim tamu.",
        },
        {
          heading: "Siapa yang dapat melihat",
          body: "Undangan yang sudah tayang dapat dibuka oleh siapa pun yang memiliki link-nya. Draf, daftar tamu, serta RSVP dan ucapan hanya dapat dilihat oleh pemilik akun.",
        },
        {
          heading: "Pembayaran",
          body: "Pembayaran diproses oleh DOKU. WUMY tidak menyimpan data kartu atau rekening pembayaranmu; kami hanya menyimpan nomor invoice, nominal, dan status pembayaran.",
        },
        {
          heading: "Penyedia layanan",
          body: "Data disimpan dan diproses menggunakan Supabase (database, login, dan penyimpanan file), Vercel (hosting), dan DOKU (pembayaran).",
        },
        {
          heading: "Menghapus data",
          body: "Kamu dapat meminta penghapusan akun dan undangan beserta datanya melalui kontak kami.",
        },
      ]}
    />
  );
}
