import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getStorefront } from "@/lib/data/shops";
import { serialize } from "@/lib/serialize";

export default async function ShopAppLayout({ children }) {
  const storefront = await getStorefront();
  const categories = serialize(storefront.categories);

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-[60vh] pb-16 800px:pb-0">{children}</main>
      <Footer />
    </>
  );
}
