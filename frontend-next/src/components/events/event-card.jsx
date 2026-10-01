"use client";

import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { addToCart } from "@/redux/slices/cart";
import { useBuyNow } from "@/redux/use-buy-now";
import { CountDown } from "@/components/events/count-down";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

export function EventCard({ data }) {
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const buyNow = useBuyNow();

  const addToCartHandler = () => {
    const exists = cart?.some((i) => i._id === data._id);
    if (exists) return toast.error("Already in cart");
    if (data.stock < 1) return toast.error("Out of stock");
    dispatch(addToCart({ ...data, qty: 1 }));
    toast.success("Added to cart");
  };

  const discountPct = data.originalPrice
    ? Math.round(((data.originalPrice - data.discountPrice) / data.originalPrice) * 100)
    : 0;

  return (
    <Card variant="solid" className="flex w-full flex-col gap-6 p-4 lg:flex-row">
      <div className="relative flex items-center justify-center lg:w-[45%]">
        <Badge variant="brand" className="absolute left-2 top-2 z-10">
          🔥 Deal
        </Badge>
        <div className="relative h-[220px] w-full sm:h-[300px]">
          {data.images?.[0] && (
            <Image src={data.images[0]} alt={data.name} fill className="object-contain" />
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between lg:w-[55%]">
        <div>
          <h2 className="font-display text-lg font-semibold text-content sm:text-2xl">
            {data.name}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm text-muted sm:text-base">{data.description}</p>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            {data.originalPrice ? (
              <span className="text-sm text-muted line-through">{formatPrice(data.originalPrice)}</span>
            ) : null}
            <span className="text-2xl font-bold text-brand">{formatPrice(data.discountPrice)}</span>
            {discountPct > 0 && (
              <span className="text-sm font-medium text-success">{discountPct}% OFF</span>
            )}
          </div>
          <p className="mt-1 text-sm text-success">{data.sold_out} sold</p>
        </div>

        <div className="mt-3 rounded-DEFAULT bg-surface-alt p-3">
          <CountDown data={data} />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href={`/product/${data._id}?isEvent=true`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              See Details
            </Button>
          </Link>
          <Button onClick={addToCartHandler} variant="outline" className="w-full sm:w-auto">
            Add to Cart
          </Button>
          <Button onClick={() => buyNow(data)} className="w-full sm:w-auto">
            Buy Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
