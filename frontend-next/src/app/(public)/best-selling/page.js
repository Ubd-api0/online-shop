import { listAllProducts } from "@/lib/data/products";
import { serialize } from "@/lib/serialize";
import { ProductCard } from "@/components/product/product-card";

export const metadata = { title: "Best Selling" };

export default async function BestSellingPage() {
  const products = serialize(await listAllProducts());
  const data = [...products].sort((a, b) => b.sold_out - a.sold_out);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 800px:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold text-content">Best Selling</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {data.map((p) => (
          <ProductCard data={p} key={p._id} />
        ))}
      </div>
      {data.length === 0 && (
        <p className="w-full py-24 text-center text-lg text-muted">No products yet.</p>
      )}
    </div>
  );
}
