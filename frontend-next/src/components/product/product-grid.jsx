import { ProductCard } from "@/components/product/product-card";

export function ProductGrid({ title, products = [] }) {
  return (
    <div className="py-6 800px:py-8">
      <div className="mx-auto max-w-7xl px-4 800px:px-6">
        {title && <h2 className="mb-4 font-display text-xl font-semibold text-content">{title}</h2>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {products.length > 0 ? (
            products.map((item) => <ProductCard key={item._id} data={item} />)
          ) : (
            <p className="col-span-full py-10 text-center text-muted">No products available</p>
          )}
        </div>
      </div>
    </div>
  );
}
