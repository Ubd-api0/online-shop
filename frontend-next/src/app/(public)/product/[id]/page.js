import { notFound } from "next/navigation";
import { findProductById, listAllProducts } from "@/lib/data/products";
import { findEventById } from "@/lib/data/events";
import { serialize } from "@/lib/serialize";
import { ProductDetails } from "@/components/product/product-details";
import { SuggestedProducts } from "@/components/product/suggested-products";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await findProductById(id).catch(() => null);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductDetailsPage({ params, searchParams }) {
  const { id } = await params;
  const { isEvent } = await searchParams;

  const [data, allProducts] = await Promise.all([
    isEvent ? findEventById(id) : findProductById(id),
    listAllProducts(),
  ]);

  if (!data) notFound();

  const plainData = serialize(data);
  const plainAllProducts = serialize(allProducts);

  return (
    <>
      <ProductDetails data={plainData} allProducts={plainAllProducts} />
      {!isEvent && <SuggestedProducts data={plainData} allProducts={plainAllProducts} />}
    </>
  );
}
