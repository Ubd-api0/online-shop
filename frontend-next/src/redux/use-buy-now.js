"use client";

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setBuyNow } from "./slices/cart";
import { isAvailable, maxQty } from "@/lib/productAvailability";

// "Buy Now": checks out a single product straight away, without adding it to
// (or disturbing) the cart. The item goes in the separate `buyNow` slot and
// the checkout page is opened in buy-now mode.
export function useBuyNow() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.user);

  return (product, qty = 1) => {
    if (!isAvailable(product)) return toast.error("Currently unavailable");
    if (qty > maxQty(product)) return toast.error(`Only ${product.stock} in stock`);
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }
    dispatch(setBuyNow({ ...product, qty }));
    router.push("/checkout?mode=buy-now");
  };
}
