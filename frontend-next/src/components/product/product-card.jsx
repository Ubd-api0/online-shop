"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Check, ImageOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { addToWishlist, removeFromWishlist } from "@/redux/slices/wishlist";
import { addToCart } from "@/redux/slices/cart";
import { useBuyNow } from "@/redux/use-buy-now";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isAvailable, isMadeToOrder, availabilityBadge } from "@/lib/productAvailability";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const discountPercent = (p) =>
  p?.originalPrice > p?.discountPrice ? Math.round(((p.originalPrice - p.discountPrice) / p.originalPrice) * 100) : 0;

export function ProductCard({ data }) {
  const liked = useSelector((state) => state.wishlist.wishlist.some((i) => i._id === data._id));
  const inCart = useSelector((state) => state.cart.cart.some((i) => i._id === data._id));
  const dispatch = useDispatch();
  const buyNow = useBuyNow();

  const toggleWishlist = () => {
    if (liked) {
      dispatch(removeFromWishlist(data._id));
    } else {
      dispatch(addToWishlist(data));
      toast.success("Saved to wishlist");
    }
  };

  const addToCartHandler = () => {
    if (inCart) return toast("Already in your cart");
    if (!isAvailable(data)) return toast.error("Currently unavailable");
    dispatch(addToCart({ ...data, qty: 1 }));
    toast.success("Added to cart");
  };

  const badge = availabilityBadge(data);
  const off = discountPercent(data);
  const available = isAvailable(data);

  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-lg">
      <button
        onClick={toggleWishlist}
        aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={liked}
        className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-surface/90 shadow-sm"
      >
        <Heart className={liked ? "size-4 fill-red-500 text-danger" : "size-4 text-content"} />
      </button>

      {(badge || off > 0) && (
        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
          {off > 0 && <span className="rounded bg-brand px-1.5 py-0.5 text-[11px] font-semibold text-white">-{off}%</span>}
          {badge && <Badge variant={isMadeToOrder(data) ? "info" : "destructive"}>{badge}</Badge>}
        </div>
      )}

      <Link href={`/product/${data._id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-surface-alt">
          {!data.images?.[0] && (
            <ImageOff className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 text-muted/50" strokeWidth={1.5} />
          )}
          {data.images?.[0] && (
            <Image
              src={data.images[0]}
              alt={data.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className={cn("object-contain transition-transform duration-300 group-hover:scale-105", !available && "opacity-60")}
            />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <Link href={`/product/${data._id}`} className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-content hover:text-brand">
          {data.name}
        </Link>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-base font-bold text-brand">{formatPrice(data.discountPrice)}</span>
          {off > 0 && <span className="text-xs text-muted line-through">{formatPrice(data.originalPrice)}</span>}
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted">
          {data.ratings > 0 && (
            <>
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span>{Number(data.ratings).toFixed(1)}</span>
              <span>·</span>
            </>
          )}
          <span>{data.sold_out > 0 ? `${data.sold_out} sold` : "New"}</span>
        </div>

        <div className="mt-auto flex gap-2 pt-2.5">
          {available ? (
            <>
              <Button
                onClick={addToCartHandler}
                size="icon"
                variant="outline"
                className={cn("size-9 shrink-0", inCart && "border-brand text-brand")}
                aria-label={inCart ? "In cart" : "Add to cart"}
              >
                {inCart ? <Check /> : <ShoppingCart />}
              </Button>
              <Button onClick={() => buyNow(data)} size="sm" className="h-9 flex-1 px-2">
                Buy Now
              </Button>
            </>
          ) : (
            <Button disabled size="sm" variant="outline" className="h-9 w-full">
              Unavailable
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
