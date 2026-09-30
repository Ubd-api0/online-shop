import { ProductCard } from "@/components/product/product-card";

export function SuggestedProducts({ data, allProducts = [] }) {
  const productData = allProducts.filter(
    (item) => item.category === data.category && item._id !== data._id
  );

  if (productData.length === 0) return null;

  return (
    <div className="mx-auto mt-6 max-w-7xl px-4 800px:px-6">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
        <h2 className="font-display text-lg font-semibold text-content md:text-xl">
          Related Products
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {productData.slice(0, 10).map((item) => (
          <ProductCard data={item} key={item._id} />
        ))}
      </div>
    </div>
  );
}
