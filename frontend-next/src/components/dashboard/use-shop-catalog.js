"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsShop } from "@/redux/slices/products";
import { getAllEventsShop } from "@/redux/slices/events";

// The store's products + events, and every review left on them (newest
// first, each tagged with the item it belongs to). Shared by the Store
// profile and Reviews pages.
export function useShopCatalog() {
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);
  const { products, isLoading: productsLoading } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllProductsShop(seller._id));
      dispatch(getAllEventsShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  const reviews = useMemo(() => {
    const tag = (kind) => (item) =>
      (item.reviews || []).map((r, i) => ({
        ...r,
        key: `${kind}-${item._id}-${i}`,
        item: { _id: item._id, name: item.name, image: item.images?.[0], kind },
      }));
    return [...(products || []).flatMap(tag("product")), ...(events || []).flatMap(tag("event"))].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [products, events]);

  const averageRating = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;

  return {
    seller,
    products: products || [],
    events: events || [],
    reviews,
    averageRating,
    loading: !seller || (productsLoading && !products),
  };
}
