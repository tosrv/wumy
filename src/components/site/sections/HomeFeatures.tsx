import { A } from "@/components/A";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { whatsappUrl } from "@/lib/contact";

function scrollFade(visible: boolean, delayMs = 0) {
  return {
    className: `transition-[opacity,transform] duration-[1600ms] ease-out ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`,
    style: { transitionDelay: visible ? `${delayMs}ms` : "0ms" } as const,
  };
}

const steps = (priceLabel: string) =>
  [
    {
      n: "01 — PILIH",
      title: "Pilih template",
      body: "Lihat demo setiap template, lalu pilih yang paling cocok dengan acaramu.",
    },
    {
      n: "02 — BAYAR",
      title: `Bayar sekali ${priceLabel}`,
      body: "Tanpa langganan. Setelah pembayaran terkonfirmasi, editor langsung terbuka.",
    },
    {
      n: "03 — ISI & TERBITKAN",
      title: "Isi data, lalu terbitkan dan bagikan",
      body: "Nama mempelai, acara, foto, hadiah digital, dan musik dengan pratinjau langsung. Kirim link-nya lewat WhatsApp.",
    },
  ] as const;

/** Only features that exist in the product today. */
const FEATURES = [
  {
    icon: "person",
    title: "Link personal per tamu",
    body: "Nama tamu tampil di undangan, mis. wumy.my.id/ayu-budi?to=Pak-Joko.",
  },
  {
    icon: "how_to_reg",
    title: "RSVP & ucapan",
    body: "Konfirmasi kehadiran dan ucapan masuk ke dashboard, bisa diunduh sebagai CSV.",
  },
  {
    icon: "account_balance_wallet",
    title: "Hadiah digital",
    body: "Rekening bank dan e-wallet dengan tombol salin.",
  },
  {
    icon: "map",
    title: "Peta & kalender",
    body: "Link Google Maps dan tombol simpan ke kalender untuk setiap acara.",
  },
  {
    icon: "photo_library",
    title: "Galeri foto",
    body: "Foto sampul, foto mempelai, dan galeri.",
  },
  {
    icon: "music_note",
    title: "Musik latar",
    body: "Unggah lagu MP3 sendiri dengan tombol putar/jeda untuk tamu.",
  },
] as const;

export function HomeFeatures({ priceLabel }: { priceLabel: string }) {
  const stepsReveal = useScrollReveal<HTMLElement>();
  const featuresReveal = useScrollReveal<HTMLElement>();
  const ctaReveal = useScrollReveal<HTMLElement>();

  return (
    <>
      <section
        className="w-full rounded-xl bg-electric-lime p-8 text-charcoal shadow-xl md:p-14 lg:p-16"
        ref={stepsReveal.ref}
      >
        <div
          className={`mb-12 max-w-2xl ${scrollFade(stepsReveal.visible, 0).className}`}
          style={scrollFade(stepsReveal.visible, 0).style}
        >
          <span className="font-label-eyebrow text-label-eyebrow font-bold uppercase tracking-widest text-charcoal/70">
            TIGA LANGKAH
          </span>
          <h2 className="mt-1 font-headline-xl text-headline-xl tracking-tight text-charcoal">
            Dari ide sampai terkirim.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps(priceLabel).map((step, i) => (
            <div
              key={step.n}
              className={`rounded-xl bg-surface-card p-7 shadow-sm ${scrollFade(stepsReveal.visible, 150 * (i + 1)).className}`}
              style={scrollFade(stepsReveal.visible, 150 * (i + 1)).style}
            >
              <span className="font-headline-sm text-[13px] uppercase tracking-widest text-text-muted">
                {step.n}
              </span>
              <h3 className="mb-3 mt-2 font-headline-md text-headline-md text-charcoal">
                {step.title}
              </h3>
              <p className="font-body-md text-body-md leading-relaxed text-text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full" ref={featuresReveal.ref}>
        <div
          className={`mb-10 max-w-2xl ${scrollFade(featuresReveal.visible, 0).className}`}
          style={scrollFade(featuresReveal.visible, 0).style}
        >
          <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-widest text-text-muted">
            YANG KAMU DAPAT
          </span>
          <h2 className="mt-1 font-headline-xl text-headline-xl tracking-tight text-charcoal">
            Semua yang dibutuhkan tamu, dalam satu link.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`flex gap-4 rounded-xl bg-surface-card p-6 shadow-sm ${scrollFade(featuresReveal.visible, 100 * (i + 1)).className}`}
              style={scrollFade(featuresReveal.visible, 100 * (i + 1)).style}
            >
              <span className="material-symbols-outlined flex size-10 shrink-0 items-center justify-center rounded-full bg-electric-lime text-[20px] text-charcoal">
                {f.icon}
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-charcoal">{f.title}</h3>
                <p className="mt-1 font-body-sm text-body-sm text-text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="harga"
        className="relative w-full overflow-hidden rounded-xl bg-electric-lime p-10 text-center shadow-xl md:p-16 lg:p-20"
        ref={ctaReveal.ref}
      >
        <div
          className={`mx-auto flex max-w-3xl flex-col items-center ${scrollFade(ctaReveal.visible, 0).className}`}
          style={scrollFade(ctaReveal.visible, 0).style}
        >
          <span className="mb-3 font-label-eyebrow text-label-eyebrow font-bold uppercase tracking-widest text-charcoal/70">
            HARGA
          </span>
          <h2 className="mb-4 font-headline-hero text-[52px] leading-[0.95] tracking-tighter text-charcoal sm:text-headline-hero">
            {priceLabel}
          </h2>
          <p className="mb-10 max-w-lg font-body-lg text-body-lg text-charcoal/80">
            Bayar sekali {priceLabel}, lalu isi undanganmu sepuasnya — tanpa langganan.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <A
              className="inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-charcoal px-8 py-4 font-label-btn text-[16px] text-white sm:px-10 sm:py-5 sm:text-[17px] shadow-2xl transition-all duration-200 hover:scale-[1.03] hover:bg-pure-black"
              data-path="order"
              href="/order"
            >
              Pesan undangan{" "}
              <span className="material-symbols-outlined text-[20px] text-electric-lime">
                arrow_forward
              </span>
            </A>
            <a
              className="px-6 py-4 font-label-btn text-label-btn text-charcoal hover:underline"
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Tanya dulu via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
