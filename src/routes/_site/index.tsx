import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/site/pages/HomePage";
import { loadPublishPriceIdr } from "@/lib/public-price";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/")({
  loader: () => loadPublishPriceIdr(),
  component: HomeRoute,
  head: () =>
    buildPageHead({
      title: "WUMY — Undangan Pernikahan Digital",
      description:
        "Buat undangan pernikahan digital tanpa ribet: pilih template, isi data, bagikan satu link lewat WhatsApp. Bayar sekali, tanpa langganan.",
      path: "/",
    }),
});

function HomeRoute() {
  return <HomePage priceIdr={Route.useLoaderData()} />;
}
