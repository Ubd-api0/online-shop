"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hydrate as hydrateCart } from "./slices/cart";
import { hydrate as hydrateWishlist } from "./slices/wishlist";

// Reads localStorage after mount (safe — never runs during SSR) and
// centralizes persistence in one place, replacing the old pattern of every
// cart/wishlist thunk calling localStorage.setItem individually.
//
// `hydrated` is state (not a ref) on purpose: it has to trigger a re-render
// so the persist effects below re-evaluate with the *post-hydration* cart
// value. With a ref, the persist effects would still see the mount's stale
// `cart` (initialState, []) in the same commit the ref flips to true, and
// immediately write that empty array back over the value just read.
export function CartHydrator() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const cartItems = localStorage.getItem("cartItems");
      if (cartItems) dispatch(hydrateCart(JSON.parse(cartItems)));
    } catch {}
    try {
      const wishlistItems = localStorage.getItem("wishlistItems");
      if (wishlistItems) dispatch(hydrateWishlist(JSON.parse(wishlistItems)));
    } catch {}
    setHydrated(true);
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("cartItems", JSON.stringify(cart));
    } catch {}
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("wishlistItems", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist, hydrated]);

  return null;
}
