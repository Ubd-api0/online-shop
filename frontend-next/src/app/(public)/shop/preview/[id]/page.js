import { notFound } from "next/navigation";
import { findShopById } from "@/lib/data/shops";
import { listProductsByShop } from "@/lib/data/products";
import { listEventsByShop } from "@/lib/data/events";
import { serialize } from "@/lib/serialize";
import { ShopInfo } from "@/components/shop/shop-info";
import { ShopProfileData } from "@/components/shop/shop-profile-data";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const shop = await findShopById(id).catch(() => null);
  if (!shop) return {};
  return { title: shop.name, description: shop.description };
}

export default async function ShopPreviewPage({ params }) {
  const { id } = await params;
  const [shop, products, events] = await Promise.all([
    findShopById(id),
    listProductsByShop(id),
    listEventsByShop(id),
  ]);

  if (!shop) notFound();

  const plainShop = serialize(shop);
  const plainProducts = serialize(products);
  const plainEvents = serialize(events);

  const totalReviewsLength = plainProducts.reduce((acc, p) => acc + (p.reviews?.length || 0), 0);
  const totalRatings = plainProducts.reduce(
    (acc, p) => acc + (p.reviews?.reduce((sum, r) => sum + r.rating, 0) || 0),
    0
  );
  const averageRating = (totalRatings / totalReviewsLength || 0).toFixed(1);

  return (
    <div className="bg-surface-alt">
      <div className="mx-auto flex max-w-7xl flex-col justify-between px-4 py-10 800px:flex-row 800px:px-6">
        <div className="rounded-DEFAULT bg-surface shadow-sm 800px:sticky 800px:top-10 800px:h-[90vh] 800px:w-[25%] 800px:overflow-y-auto">
          <ShopInfo shop={plainShop} productsCount={plainProducts.length} averageRating={averageRating} />
        </div>
        <div className="mt-5 rounded-DEFAULT 800px:mt-0 800px:w-[72%]">
          <ShopProfileData products={plainProducts} events={plainEvents} />
        </div>
      </div>
    </div>
  );
}
