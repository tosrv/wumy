export type FaqItem = { question: string; answer: string };

/** FAQ copy. Answers describe only what the product does today. */
export function faqItems(priceLabel: string): FaqItem[] {
  return [
    {
      question: "Apa itu WUMY?",
      answer:
        "WUMY adalah layanan undangan pernikahan digital. Kamu memilih template, mengisi data pernikahan, lalu membagikan satu link ke tamu lewat WhatsApp atau media lain.",
    },
    {
      question: "Berapa harganya?",
      answer: `${priceLabel} sekali bayar per undangan, tanpa langganan. Kamu membayar setelah memilih template, lalu bisa mengisi dan mengubah undangan sepuasnya.`,
    },
    {
      question: "Bagaimana cara membayar?",
      answer:
        "Lewat DOKU: virtual account bank, QRIS, e-wallet, dan metode lain yang tersedia di halaman pembayaran. Setelah pembayaran terkonfirmasi, editor langsung terbuka.",
    },
    {
      question: "Apakah bisa melihat hasilnya sebelum membayar?",
      answer:
        "Bisa lewat demo setiap template. Setelah membayar, editor menampilkan pratinjau langsung, dan undangan baru tayang saat kamu menekan Terbitkan.",
    },
    {
      question: "Apa saja yang ada di undangan?",
      answer:
        "Nama dan foto mempelai, jadwal acara (akad/pemberkatan, resepsi, dll.) dengan link peta dan tombol simpan ke kalender, galeri foto, hadiah digital (rekening & e-wallet), musik latar, serta formulir RSVP dan ucapan.",
    },
    {
      question: "Apa itu link personal untuk tamu?",
      answer:
        "Setiap tamu bisa mendapat link dengan namanya, misalnya wumy.my.id/ayu-budi?to=Pak-Joko. Nama tamu akan tampil di undangan. Daftar tamu dan link-nya dikelola di dashboard.",
    },
    {
      question: "Bagaimana saya melihat siapa yang hadir?",
      answer:
        "Konfirmasi kehadiran dan ucapan dari tamu masuk ke dashboard dan bisa diunduh sebagai file CSV.",
    },
    {
      question: "Apakah undangan bisa diubah setelah tayang?",
      answer:
        "Isi undangan tetap bisa diubah dan perubahannya langsung terlihat. Alamat (link) undangan dikunci setelah tayang supaya link yang sudah dibagikan tidak rusak. Jika perlu mengganti alamat, hubungi kami.",
    },
    {
      question: "Berapa lama undangan bisa diakses?",
      answer:
        "Undangan tetap bisa dibuka setelah hari pernikahan. Jika suatu saat ada perubahan kebijakan masa aktif, kami akan memberi tahu pemilik undangan lebih dulu.",
    },
    {
      question: "Berapa banyak foto dan musik yang bisa diunggah?",
      answer:
        "Foto sampul, satu foto untuk setiap mempelai, dan galeri hingga 6 foto (maksimal 20 MB per foto, otomatis diperkecil saat diunggah). Musik latar berupa satu file MP3 (maksimal 10 MB). Gunakan lagu yang boleh kamu bagikan.",
    },
    {
      question: "Apakah bisa refund?",
      answer:
        "Refund penuh selama undangan belum pernah tayang, paling lambat 7 hari setelah pembayaran, apa pun alasannya. Kendala teknis dari pihak WUMY yang tidak bisa kami perbaiki dalam 3 hari kerja juga dapat di-refund penuh. Detailnya ada di halaman Kebijakan Refund.",
    },
    {
      question: "Satu akun bisa membuat berapa undangan?",
      answer: "Satu akun untuk satu undangan pernikahan.",
    },
  ];
}
