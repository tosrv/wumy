import { createFileRoute } from "@tanstack/react-router";
import { ProductPage } from "@/components/site/pages/ProductPage";
import { loadPublishPriceIdr } from "@/lib/public-price";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/product")({
  loader: () => loadPublishPriceIdr(),
  component: ProductRoute,
  head: () =>
    buildPageHead({
      title: "Template Undangan Pernikahan Digital",
      description:
        "Enam gaya undangan pernikahan digital: minimal, editorial, romantis, ceria, modern, dan tradisional. Lihat demonya dulu.",
      path: "/product",
    }),
});

function ProductRoute() {
  return <ProductPage priceIdr={Route.useLoaderData()} />;
}
