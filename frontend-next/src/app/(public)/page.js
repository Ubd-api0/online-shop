import { getStorefront } from "@/lib/data/shops";
import { queryProducts } from "@/lib/data/products";
import { serialize } from "@/lib/serialize";
import { listAllEvents } from "@/lib/data/events";
import { Hero } from "@/components/home/hero";
import { CategoriesSection } from "@/components/home/categories-section";
import { EventsWidget } from "@/components/home/events-widget";
import { ProductGrid } from "@/components/product/product-grid";
import { InfiniteProductGrid } from "@/components/product/infinite-product-grid";
import appConfig from "@/config/appConfig";

// Rendered from the database; refreshed every 60s and on demand after
// dashboard edits (lib/revalidate.js) — never frozen at build time.
export const revalidate = 60;

export async function generateMetadata() {
  const storefront = await getStorefront();
  return {
    title: `${storefront.name || appConfig.name} — ${appConfig.tagline}`,
    description: storefront.description || appConfig.tagline,
  };
}

export default async function HomePage() {
  const [storefront, bestDeals, feed, events] = await Promise.all([
    getStorefront(),
    queryProducts({ sort: "best_selling", limit: 10 }),
    queryProducts({ sort: "newest", page: 1 }),
    listAllEvents(),
  ]);

  const plainStorefront = serialize(storefront);
  const plainBestDeals = serialize(bestDeals.products);
  const plainFeed = serialize(feed);
  const plainEvents = serialize(events);

  return (
    <>
      <Hero hero={plainStorefront.hero} />
      <CategoriesSection
        categories={plainStorefront.categories}
        featureTiles={plainStorefront.featureTiles}
      />
      <ProductGrid title="Best Deals" products={plainBestDeals} />
      <EventsWidget allEvents={plainEvents} />
      {/* Endless "Just for you" feed, like Daraz's home page */}
      <section className="mx-auto max-w-7xl px-4 py-6 800px:px-6 800px:py-8">
        <h2 className="mb-4 font-display text-xl font-semibold text-content">Just For You</h2>
        <InfiniteProductGrid initial={plainFeed} query={{ sort: "newest" }} />
      </section>
    </>
  );
}
