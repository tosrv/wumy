import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/pages/LegalPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/terms")({
  component: TermsPage,
  head: () =>
    buildPageHead({
      title: "Syarat & Ketentuan",
      description: "Syarat dan ketentuan penggunaan layanan undangan digital WUMY.",
      path: "/terms",
    }),
});

function TermsPage() {
  return (
    <LegalPage
      title="Syarat & Ketentuan"
      summary="Dengan menggunakan WUMY, kamu menyetujui syarat berikut."
      updated="November 2026"
      sections={[
        {
          heading: "Layanan",
          body: "WUMY menyediakan pembuatan undangan pernikahan digital beserta daftar tamu, link personal, dan RSVP. Fitur dapat berubah seiring pengembangan layanan.",
        },
        {
          heading: "Akun",
          body: "Satu akun digunakan untuk satu undangan pernikahan. Jaga kerahasiaan kata sandi akunmu.",
        },
        {
          heading: "Harga dan pembayaran",
          body: "Pembayaran dilakukan sekali per undangan, sebelum mengisi undangan, sesuai harga yang tercantum saat pembayaran, tanpa langganan. Pembayaran diproses oleh DOKU. Setelah pembayaran terkonfirmasi, kamu bisa mengisi undangan dan menerbitkannya saat siap.",
        },
        {
          heading: "Konten milikmu",
          body: "Kamu tetap memiliki konten yang kamu unggah (teks, foto, musik). Kamu memberi WUMY izin terbatas untuk menyimpan dan menampilkannya agar tamu dapat membuka undanganmu. Kamu bertanggung jawab memiliki hak atas foto, teks, dan musik yang kamu gunakan.",
        },
        {
          heading: "Alamat undangan",
          body: "Alamat (link) undangan dikunci setelah undangan tayang agar link yang sudah dibagikan tetap berfungsi. Perubahan alamat dapat diminta melalui kontak kami.",
        },
        {
          heading: "Penggunaan yang dilarang",
          body: "Dilarang menggunakan WUMY untuk spam, penipuan, pelecehan, konten ilegal, atau konten yang melanggar hak orang lain. Kami dapat menurunkan undangan atau menangguhkan akun yang melanggar ketentuan ini.",
        },
        {
          heading: "Refund",
          body: "Ketentuan pengembalian dana diatur di halaman Kebijakan Refund.",
        },
      ]}
    />
  );
}
