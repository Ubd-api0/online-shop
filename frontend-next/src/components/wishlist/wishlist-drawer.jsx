"use client";

import Image from "next/image";
import { Heart, ShoppingCart, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "@/redux/slices/wishlist";
import { addToCart } from "@/redux/slices/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function WishlistDrawer({ open, onOpenChange }) {
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const dispatch = useDispatch();

  const addToCartHandler = (data) => {
    dispatch(addToCart({ ...data, qty: 1 }));
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Heart className="size-5" />
            <SheetTitle>{wishlist.length} Items</SheetTitle>
          </div>
        </SheetHeader>

        {wishlist.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted">
            No items in wishlist
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {wishlist.map((item) => (
              <div key={item._id} className="flex items-center gap-3 border-b border-border p-4">
                <div className="relative size-[70px] shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
                  {item.images?.[0] && (
                    <Image src={item.images[0]} alt={item.name} fill className="object-contain" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm text-content">{item.name}</p>
                  <p className="font-bold text-brand">${item.discountPrice}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => addToCartHandler(item)}
                    className="text-content hover:text-brand"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="size-4" />
                  </button>
                  <button
                    onClick={() => dispatch(removeFromWishlist(item._id))}
                    className="text-muted hover:text-content"
                    aria-label="Remove"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
