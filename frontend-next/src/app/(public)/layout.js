import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getStorefront } from "@/lib/data/shops";

export default async function PublicLayout({ children }) {
  const storefront = await getStorefront();
  const categories = JSON.parse(JSON.stringify(storefront.categories));

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-[60vh] pb-16 800px:pb-0">{children}</main>
      <Footer />
    </>
  );
}
