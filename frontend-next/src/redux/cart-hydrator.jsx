"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hydrate as hydrateCart } from "./slices/cart";
import { hydrate as hydrateWishlist } from "./slices/wishlist";

// Reads localStorage after mount (safe — never runs during SSR) and
// centralizes persistence in one place, replacing the old pattern of every
// cart/wishlist thunk calling localStorage.setItem individually.
export function CartHydrator() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const cartItems = localStorage.getItem("cartItems");
      if (cartItems) dispatch(hydrateCart(JSON.parse(cartItems)));
    } catch {}
    try {
      const wishlistItems = localStorage.getItem("wishlistItems");
      if (wishlistItems) dispatch(hydrateWishlist(JSON.parse(wishlistItems)));
    } catch {}
    hydrated.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem("cartItems", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem("wishlistItems", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  return null;
}
