import { queryProducts } from "@/lib/data/products";
import { serialize } from "@/lib/serialize";
import { InfiniteProductGrid } from "@/components/product/infinite-product-grid";

export const metadata = { title: "Best Selling" };

export default async function BestSellingPage() {
  const query = { sort: "best_selling" };
  const first = serialize(await queryProducts({ ...query, page: 1 }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 800px:px-6 800px:py-8">
      <h1 className="mb-5 font-display text-xl font-semibold text-content sm:text-2xl">Best Selling</h1>
      <InfiniteProductGrid initial={first} query={query} emptyText="No products yet." />
    </div>
  );
}
