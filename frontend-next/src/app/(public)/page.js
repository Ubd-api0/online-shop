import { getStorefront } from "@/lib/data/shops";
import { listAllProducts } from "@/lib/data/products";
import { listAllEvents } from "@/lib/data/events";
import { Hero } from "@/components/home/hero";
import { CategoriesSection } from "@/components/home/categories-section";
import { EventsWidget } from "@/components/home/events-widget";
import { ProductGrid } from "@/components/product/product-grid";
import appConfig from "@/config/appConfig";

export async function generateMetadata() {
  const storefront = await getStorefront();
  return {
    title: `${storefront.name || appConfig.name} — ${appConfig.tagline}`,
    description: storefront.description || appConfig.tagline,
  };
}

export default async function HomePage() {
  const [storefront, products, events] = await Promise.all([
    getStorefront(),
    listAllProducts(),
    listAllEvents(),
  ]);

  const bestDeals = [...products].sort((a, b) => b.sold_out - a.sold_out).slice(0, 10);
  const plainStorefront = JSON.parse(JSON.stringify(storefront));
  const plainProducts = JSON.parse(JSON.stringify(products));
  const plainBestDeals = JSON.parse(JSON.stringify(bestDeals));
  const plainEvents = JSON.parse(JSON.stringify(events));

  return (
    <>
      <Hero hero={plainStorefront.hero} />
      <CategoriesSection
        categories={plainStorefront.categories}
        featureTiles={plainStorefront.featureTiles}
      />
      <ProductGrid title="Best Deals" products={plainBestDeals} />
      <EventsWidget allEvents={plainEvents} />
      <ProductGrid title="Featured Products" products={plainProducts} />
    </>
  );
}
