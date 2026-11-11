import { HomeHero } from "@/components/site/sections/HomeHero";
import { HomeTemplates } from "@/components/site/sections/HomeTemplates";
import { HomeFeatures } from "@/components/site/sections/HomeFeatures";
import { formatIdr } from "@/lib/pricing";

export function HomePage({ priceIdr }: { priceIdr: number }) {
  const priceLabel = formatIdr(priceIdr);
  return (
    <main className="w-full pt-20 bg-surface-canvas">
      <div className="flex flex-col w-full">
        <div className="max-w-[1240px] mx-auto w-full px-margin md:px-margin-tablet lg:px-margin-desktop space-y-space-2xl md:space-y-space-3xl py-space-xl">
          <HomeHero priceLabel={priceLabel} />
          <HomeTemplates />
          <HomeFeatures priceLabel={priceLabel} />
        </div>
      </div>
    </main>
  );
}
