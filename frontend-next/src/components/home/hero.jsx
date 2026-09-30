import Link from "next/link";
import { Button } from "@/components/ui/button";

const DEFAULT_IMG = "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg";

export function Hero({ hero }) {
  const title = hero?.title || "Best Collection for Home Decoration";
  const subtitle =
    hero?.subtitle || "Discover modern furniture and decoration items at best prices.";
  const ctaText = hero?.ctaText || "Shop Now";
  const ctaLink = hero?.ctaLink || "/products";
  const image = hero?.image || DEFAULT_IMG;

  return (
    <div
      className="flex min-h-[60vh] w-full items-center bg-cover bg-center px-4 sm:min-h-[70vh]"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="glass-surface max-w-xl rounded-lg p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-gray-100 sm:text-base">{subtitle}</p>
        <Link href={ctaLink}>
          <Button className="mt-5">{ctaText}</Button>
        </Link>
      </div>
    </div>
  );
}
