import Link from "next/link";
import { Button } from "@/components/ui/button";

const DEFAULT_IMG = "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg";

// Text sits on its own dark scrim (not the theme's glass, which is near-white
// in light mode) so it reads on any photo, in both themes.
export function Hero({ hero }) {
  const title = hero?.title || "Best Collection for Home Decoration";
  const subtitle =
    hero?.subtitle || "Discover modern furniture and decoration items at best prices.";
  const ctaText = hero?.ctaText || "Shop Now";
  const ctaLink = hero?.ctaLink || "/products";
  const image = hero?.image || DEFAULT_IMG;

  return (
    <div
      className="relative flex min-h-[60vh] w-full items-center bg-cover bg-center px-4 sm:min-h-[70vh] sm:px-8"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" aria-hidden />
      <div className="relative max-w-xl rounded-lg border border-white/15 bg-black/45 p-5 shadow-2xl backdrop-blur-md sm:p-7">
        <h1 className="font-display text-2xl font-bold leading-tight text-white drop-shadow sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-white/85 sm:text-base">{subtitle}</p>
        <Link href={ctaLink}>
          <Button className="mt-5">{ctaText}</Button>
        </Link>
      </div>
    </div>
  );
}
