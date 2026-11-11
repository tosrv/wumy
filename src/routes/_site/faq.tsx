import { createFileRoute } from "@tanstack/react-router";
import { FaqPage } from "@/components/site/pages/FaqPage";
import { loadPublishPriceIdr } from "@/lib/public-price";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/faq")({
  loader: () => loadPublishPriceIdr(),
  component: FaqRoute,
  head: () =>
    buildPageHead({
      title: "FAQ",
      description:
        "Jawaban soal harga, pembayaran, template, link personal tamu, RSVP, dan refund undangan pernikahan digital WUMY.",
      path: "/faq",
    }),
});

function FaqRoute() {
  return <FaqPage priceIdr={Route.useLoaderData()} />;
}
