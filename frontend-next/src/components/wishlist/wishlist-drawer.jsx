"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Trash2, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { removeFromWishlist } from "@/redux/slices/wishlist";
import { addToCart } from "@/redux/slices/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { isAvailable } from "@/lib/productAvailability";
import { DRAWER_CLASS, DrawerTitle, DrawerEmpty, ItemThumb, PriceLine } from "@/components/cart/drawer-parts";

export function WishlistDrawer({ open, onOpenChange }) {
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const close = () => onOpenChange(false);

  const inCart = (id) => cart.some((c) => c._id === id);
  const addable = wishlist.filter((i) => isAvailable(i) && !inCart(i._id));

  const add = (item, silent = false) => {
    const { qty, selected, ...product } = item;
    dispatch(addToCart({ ...product, qty: 1 }));
    if (!silent) toast.success("Added to cart");
  };

  const addAll = () => {
    addable.forEach((i) => add(i, true));
    toast.success(`${addable.length} item(s) added to cart`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={DRAWER_CLASS}>
        <SheetHeader>
          <SheetTitle asChild>
            <div>
              <DrawerTitle icon={Heart} title="Wishlist" count={wishlist.length} />
            </div>
          </SheetTitle>
        </SheetHeader>

        {wishlist.length === 0 ? (
          <DrawerEmpty
            icon={Heart}
            title="Your wishlist is empty"
            text="Tap the heart on any product to save it here for later."
            onAction={close}
          />
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {wishlist.map((item) => {
                const available = isAvailable(item);
                const already = inCart(item._id);
                return (
                  <li key={item._id} className="flex gap-3 px-4 py-4">
                    <ItemThumb item={item} onNavigate={close} dim={!available} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/product/${item._id}`}
                        onClick={close}
                        className="line-clamp-2 text-sm leading-5 text-content hover:text-brand"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1">
                        <PriceLine item={item} />
                      </div>
                      {!available && <span className="mt-0.5 text-xs font-medium text-danger">Out of stock</span>}

                      <div className="mt-2 flex items-center justify-between gap-2">
                        {available ? (
                          <Button
                            size="sm"
                            variant={already ? "outline" : "solid"}
                            className="h-8 px-3"
                            disabled={already}
                            onClick={() => add(item)}
                          >
                            {already ? <Check /> : <ShoppingCart />}
                            {already ? "In cart" : "Add to cart"}
                          </Button>
                        ) : (
                          <span />
                        )}
                        <button
                          onClick={() => dispatch(removeFromWishlist(item._id))}
                          className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-surface-alt hover:text-danger"
                          aria-label="Remove from wishlist"
                          title="Remove"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {addable.length > 0 && (
              <div className="border-t border-border bg-surface p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
                <Button className="h-12 w-full text-base" onClick={addAll}>
                  <ShoppingCart /> Add {addable.length > 1 ? `all ${addable.length}` : "it"} to cart
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
