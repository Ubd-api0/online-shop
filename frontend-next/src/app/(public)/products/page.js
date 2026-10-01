import { queryProducts, PRODUCT_SORTS } from "@/lib/data/products";
import { serialize } from "@/lib/serialize";
import { InfiniteProductGrid } from "@/components/product/infinite-product-grid";
import { SortBar } from "@/components/product/sort-bar";

export async function generateMetadata({ searchParams }) {
  const { category, q } = await searchParams;
  return { title: q ? `Search: ${q}` : category || "Products" };
}

export default async function ProductsPage({ searchParams }) {
  const { category, q, sort: rawSort } = await searchParams;
  const sort = PRODUCT_SORTS[rawSort] ? rawSort : "newest";
  const query = { category, q, sort };
  const first = serialize(await queryProducts({ ...query, page: 1 }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 800px:px-6 800px:py-8">
      <div className="mb-4">
        <h1 className="font-display text-xl font-semibold text-content sm:text-2xl">
          {q ? `Results for “${q}”` : category || "All Products"}
        </h1>
        <p className="mt-0.5 text-sm text-muted">{first.total} item(s)</p>
      </div>
      <div className="mb-5">
        <SortBar params={{ category, q }} active={sort} />
      </div>
      <InfiniteProductGrid key={JSON.stringify(query)} initial={first} query={query} />
    </div>
  );
}
