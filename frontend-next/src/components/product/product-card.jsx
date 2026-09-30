"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { addToWishlist, removeFromWishlist } from "@/redux/slices/wishlist";
import { addToCart } from "@/redux/slices/cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isAvailable, isMadeToOrder, availabilityBadge } from "@/lib/productAvailability";

export function ProductCard({ data }) {
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const [click, setClick] = useState(false);

  useEffect(() => {
    setClick(wishlist?.some((i) => i._id === data._id));
  }, [wishlist, data]);

  const toggleWishlist = () => {
    setClick(!click);
    if (click) dispatch(removeFromWishlist(data._id));
    else dispatch(addToWishlist(data));
  };

  const addToCartHandler = () => {
    const exists = cart?.find((i) => i._id === data._id);
    if (exists) return toast.error("Already in cart!");
    if (!isAvailable(data)) return toast.error("Currently unavailable");
    dispatch(addToCart({ ...data, qty: 1 }));
    toast.success("Added to cart!");
  };

  const badge = availabilityBadge(data);

  return (
    <Card variant="glass" className="relative w-full p-3 transition-transform hover:-translate-y-1">
      <button
        onClick={toggleWishlist}
        aria-label="Toggle wishlist"
        className="glass-surface absolute right-2 top-2 z-10 rounded-full p-1.5"
      >
        <Heart className={click ? "size-4 fill-red-500 text-red-500" : "size-4 text-content"} />
      </button>

      {badge && (
        <Badge
          variant={isMadeToOrder(data) ? "brand" : "destructive"}
          className="absolute left-2 top-2 z-10"
        >
          {badge}
        </Badge>
      )}

      <Link href={`/product/${data._id}`} className="block">
        <div className="relative h-[160px] w-full overflow-hidden rounded-DEFAULT bg-surface-alt">
          {data.images?.[0] && (
            <Image
              src={data.images[0]}
              alt={data.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className="object-contain"
            />
          )}
        </div>
      </Link>

      <h5 className="mt-2 text-xs text-muted">{data.shop?.name}</h5>
      <h4 className="line-clamp-2 text-sm font-medium text-content">{data.name}</h4>

      <div className="mt-1 flex items-center gap-2">
        <span className="font-bold text-brand">${data.discountPrice}</span>
        {data.originalPrice ? (
          <span className="text-xs text-muted line-through">${data.originalPrice}</span>
        ) : null}
      </div>

      <Button
        onClick={addToCartHandler}
        disabled={!isAvailable(data)}
        size="sm"
        className="mt-2 w-full"
      >
        {isAvailable(data) ? "Add to Cart" : "Unavailable"}
      </Button>
    </Card>
  );
}
