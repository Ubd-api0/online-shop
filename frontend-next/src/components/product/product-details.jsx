"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { addToWishlist, removeFromWishlist } from "@/redux/slices/wishlist";
import { addToCart } from "@/redux/slices/cart";
import { useBuyNow } from "@/redux/use-buy-now";
import api from "@/lib/axios";
import { Ratings } from "@/components/product/ratings";
import { Button } from "@/components/ui/button";
import { isMadeToOrder, isAvailable, maxQty, availabilityLabel } from "@/lib/productAvailability";
import { formatPrice } from "@/lib/format";

export function ProductDetails({ data, allProducts = [] }) {
  const cart = useSelector((state) => state.cart.cart);
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const buyNow = useBuyNow();

  const totalReviewsLength = allProducts.reduce((acc, p) => acc + (p.reviews?.length || 0), 0);
  const totalRatings = allProducts.reduce(
    (acc, p) => acc + (p.reviews?.reduce((sum, r) => sum + r.rating, 0) || 0),
    0
  );
  const averageRating = (totalRatings / totalReviewsLength || 0).toFixed(2);

  const [count, setCount] = useState(1);
  const [select, setSelect] = useState(0);
  const [click, setClick] = useState(false);
  const [active, setActive] = useState(1);

  useEffect(() => {
    setClick(wishlist?.some((i) => i._id === data?._id));
  }, [wishlist, data]);

  const addToCartHandler = () => {
    const exists = cart?.some((i) => i._id === data._id);
    if (exists) return toast.error("Already in cart");
    if (!isAvailable(data)) return toast.error("Currently unavailable");
    if (count > maxQty(data)) return toast.error(`Only ${data.stock} in stock`);
    dispatch(addToCart({ ...data, qty: count }));
    toast.success("Added to cart");
  };

  const toggleWishlist = () => {
    setClick(!click);
    if (click) dispatch(removeFromWishlist(data._id));
    else dispatch(addToWishlist(data));
  };

  const handleMessageSubmit = async () => {
    if (!isAuthenticated) return toast.error("Login required");
    try {
      const { data: res } = await api.post("/conversation/create-new-conversation", {
        groupTitle: data._id + user._id,
        userId: user._id,
        sellerId: data.shop._id,
      });
      router.push(`/profile/inbox?conversation=${res.conversation._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  if (!data) return null;

  return (
    <div className="pb-[140px] text-content lg:pb-5">
      <div className="mx-auto max-w-6xl px-3 py-6 md:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-[45%]">
            <div className="relative h-[280px] rounded-DEFAULT border border-border p-2 sm:h-[400px]">
              {data.images?.[select] && (
                <Image
                  src={data.images[select]}
                  alt={data.name}
                  fill
                  className="object-contain"
                  priority
                />
              )}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {data.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelect(i)}
                  className={`relative size-[70px] shrink-0 border ${
                    select === i ? "border-brand" : "border-border"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-contain" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative lg:w-[55%]">
            <button
              onClick={toggleWishlist}
              className="absolute right-0 top-0"
              aria-label="Toggle wishlist"
            >
              <Heart className={click ? "size-[26px] fill-red-500 text-danger" : "size-[26px] text-content"} />
            </button>

            <h1 className="text-lg font-semibold md:text-2xl">{data.name}</h1>

            <div className="mt-2">
              <Ratings rating={data?.ratings} />
            </div>

            <div className="mt-4 rounded-DEFAULT bg-surface-alt p-3">
              <div className="flex items-center gap-3">
                {data.originalPrice ? (
                  <span className="text-danger line-through">{formatPrice(data.originalPrice)}</span>
                ) : null}
                <span className="text-2xl font-bold text-success">{formatPrice(data.discountPrice)}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{data.sold_out} sold</p>
              <p
                className={`mt-1 text-sm font-medium ${
                  isMadeToOrder(data) ? "text-info" : isAvailable(data) ? "text-success" : "text-danger"
                }`}
              >
                {availabilityLabel(data)}
              </p>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm text-muted md:text-base">
              {data.description}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setCount(Math.max(1, count - 1))}
                className="rounded border border-border bg-surface-alt px-3 py-1"
              >
                -
              </button>
              <span className="px-4">{count}</span>
              <button
                onClick={() => setCount(Math.min(maxQty(data), count + 1))}
                className="rounded border border-border bg-surface-alt px-3 py-1"
              >
                +
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => buyNow(data, count)} disabled={!isAvailable(data)} className="flex-1">
                {isAvailable(data) ? "Buy Now" : "Unavailable"}
              </Button>
              <Button
                onClick={addToCartHandler}
                disabled={!isAvailable(data)}
                variant="outline"
                className="flex-1"
              >
                Add to Cart
              </Button>
              <Button onClick={handleMessageSubmit} variant="outline" className="flex-1">
                Chat <MessageCircle className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-surface mx-3 rounded-DEFAULT px-3 py-4 md:mx-6 md:px-8">
        <div className="flex gap-6 overflow-x-auto whitespace-nowrap border-b border-border">
          {[
            [1, "Product Details"],
            [2, `Reviews (${data.reviews?.length || 0})`],
            [3, "Seller Info"],
          ].map(([tab, label]) => (
            <button key={tab} onClick={() => setActive(tab)} className="relative pb-2">
              <h5 className="text-sm font-semibold md:text-base">{label}</h5>
              {active === tab && (
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-brand" />
              )}
            </button>
          ))}
        </div>

        {active === 1 && (
          <div className="whitespace-pre-line py-4 text-sm leading-7 text-muted md:text-base">
            {data.description}
          </div>
        )}

        {active === 2 && (
          <div className="max-h-[400px] space-y-4 overflow-y-auto py-4">
            {data?.reviews?.length > 0 ? (
              data.reviews.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-surface-alt">
                    {item.user?.avatar && (
                      <Image src={item.user.avatar} alt="" fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{item.user?.name}</h4>
                      <Ratings rating={item.rating} />
                    </div>
                    <p className="text-sm text-muted">{item.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No reviews yet for this product.</p>
            )}
          </div>
        )}

        {active === 3 && (
          <div className="flex flex-col justify-between gap-6 py-5 md:flex-row">
            <div className="flex-1">
              <Link href={`/shop/preview/${data.shop?._id}`}>
                <div className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-surface-alt">
                    {data?.shop?.avatar && (
                      <Image src={data.shop.avatar} alt="" fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{data.shop?.name}</h3>
                    <p className="text-xs text-muted">⭐ {averageRating}/5 Rating</p>
                  </div>
                </div>
              </Link>
              <p className="mt-3 text-sm text-muted">{data.shop?.description}</p>
            </div>

            <div className="flex flex-col gap-2 md:text-right">
              <p className="text-sm">
                Joined: <span className="font-medium">{data.shop?.createdAt?.slice(0, 10)}</span>
              </p>
              <p className="text-sm">
                Products: <span className="font-medium">{allProducts.length}</span>
              </p>
              <p className="text-sm">
                Reviews: <span className="font-medium">{totalReviewsLength}</span>
              </p>
              <Link href={`/shop/preview/${data.shop?._id}`}>
                <Button size="sm" className="mt-3">
                  Visit Shop
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* mobile sticky bar — sits above the header's mobile bottom nav */}
      <div className="fixed bottom-[56px] left-0 z-sticky flex w-full border-t border-border bg-surface lg:hidden 800px:bottom-0">
        <button onClick={toggleWishlist} className="flex w-1/5 justify-center py-3">
          <Heart className={click ? "size-6 fill-red-500 text-danger" : "size-6 text-content"} />
        </button>
        <button onClick={handleMessageSubmit} className="w-1/5 py-3 text-sm font-semibold text-content">
          Chat
        </button>
        <button
          onClick={addToCartHandler}
          disabled={!isAvailable(data)}
          className="w-[30%] bg-blue-600 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add to Cart
        </button>
        <button
          onClick={() => buyNow(data, count)}
          disabled={!isAvailable(data)}
          className="w-[30%] bg-brand text-sm font-semibold text-white disabled:opacity-50"
        >
          {isAvailable(data) ? "Buy Now" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
