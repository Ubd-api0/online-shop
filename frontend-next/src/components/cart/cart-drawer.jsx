"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, Trash2, Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  addToCart,
  removeFromCart,
  removeManyFromCart,
  toggleCartItem,
  setAllCartSelected,
  clearBuyNow,
} from "@/redux/slices/cart";
import { addToWishlist } from "@/redux/slices/wishlist";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { maxQty } from "@/lib/productAvailability";
import {
  DRAWER_CLASS,
  DrawerTitle,
  DrawerEmpty,
  ItemThumb,
  PriceLine,
  QtyStepper,
} from "@/components/cart/drawer-parts";
import { cn } from "@/lib/utils";

const checkboxClass = "size-[18px] shrink-0 cursor-pointer accent-brand";

export function CartDrawer({ open, onOpenChange }) {
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const router = useRouter();
  const close = () => onOpenChange(false);

  const selected = cart.filter((i) => i.selected);
  const allSelected = cart.length > 0 && selected.length === cart.length;
  const selectedQty = selected.reduce((s, i) => s + i.qty, 0);
  const subtotal = selected.reduce((acc, i) => acc + i.qty * i.discountPrice, 0);
  const savings = selected.reduce(
    (acc, i) => acc + (i.originalPrice > i.discountPrice ? (i.originalPrice - i.discountPrice) * i.qty : 0),
    0
  );

  const checkout = () => {
    if (selected.length === 0) return toast.error("Select at least one item to checkout");
    // Checkout from the cart always wins over a stale Buy Now left in the session.
    dispatch(clearBuyNow());
    close();
    router.push("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={DRAWER_CLASS}>
        <SheetHeader>
          <SheetTitle asChild>
            <div>
              <DrawerTitle icon={ShoppingBag} title="My Cart" count={cart.length} />
            </div>
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <DrawerEmpty
            icon={ShoppingBag}
            title="Your cart is empty"
            text="Looks like you haven't added anything yet. Explore our products and find something you love."
            onAction={close}
          />
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border bg-surface-alt/60 px-4 py-2.5">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-content">
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={allSelected}
                  onChange={() => dispatch(setAllCartSelected(!allSelected))}
                />
                Select all ({cart.length})
              </label>
              {selected.length > 0 && (
                <button
                  onClick={() => dispatch(removeManyFromCart(selected.map((i) => i._id)))}
                  className="flex items-center gap-1 text-xs font-medium text-danger hover:underline"
                >
                  <Trash2 className="size-3.5" /> Delete ({selected.length})
                </button>
              )}
            </div>

            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {cart.map((item) => (
                <CartItem key={item._id} item={item} dispatch={dispatch} onNavigate={close} />
              ))}
            </ul>

            <div className="space-y-3 border-t border-border bg-surface p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">
                    Subtotal ({selectedQty} item{selectedQty === 1 ? "" : "s"})
                  </span>
                  <span className="text-lg font-bold text-content">{formatPrice(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-success">
                    <span>You save</span>
                    <span className="font-medium">{formatPrice(savings)}</span>
                  </div>
                )}
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <Truck className="size-3.5" /> Delivery fee calculated at checkout
                </p>
              </div>
              <Button className="h-12 w-full text-base" onClick={checkout} disabled={selected.length === 0}>
                {selected.length === 0 ? "Select items to checkout" : `Checkout (${selected.length})`}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartItem({ item, dispatch, onNavigate }) {
  const madeToOrder = item.fulfillment === "made_to_order";
  const limit = madeToOrder ? undefined : maxQty(item);
  const short = !madeToOrder && (item.stock || 0) < item.qty;
  const lowStock = !madeToOrder && !short && item.stock > 0 && item.stock <= 5;

  const setQty = (qty) => {
    if (limit != null && qty > limit) return toast.error(`Only ${item.stock} in stock`);
    dispatch(addToCart({ ...item, qty }));
  };

  const moveToWishlist = () => {
    dispatch(addToWishlist(item));
    dispatch(removeFromCart(item._id));
    toast.success("Moved to wishlist");
  };

  return (
    <li className={cn("flex gap-3 px-4 py-4 transition-opacity", !item.selected && "opacity-60")}>
      <input
        type="checkbox"
        className={cn(checkboxClass, "mt-8")}
        checked={!!item.selected}
        onChange={() => dispatch(toggleCartItem(item._id))}
        aria-label={`Select ${item.name}`}
      />
      <ItemThumb item={item} onNavigate={onNavigate} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/product/${item._id}`}
          onClick={onNavigate}
          className="line-clamp-2 text-sm leading-5 text-content hover:text-brand"
        >
          {item.name}
        </Link>
        {madeToOrder ? (
          <span className="mt-0.5 text-xs text-info">
            Made to order{item.leadTimeDays ? ` · ships in ~${item.leadTimeDays} days` : ""}
          </span>
        ) : short ? (
          <span className="mt-0.5 text-xs font-medium text-danger">Only {item.stock || 0} left — reduce quantity</span>
        ) : lowStock ? (
          <span className="mt-0.5 text-xs text-warning">Only {item.stock} left</span>
        ) : null}

        <div className="mt-1">
          <PriceLine item={item} qty={item.qty} />
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <QtyStepper value={item.qty} max={limit} onDec={() => setQty(item.qty - 1)} onInc={() => setQty(item.qty + 1)} />
          <div className="flex items-center gap-1">
            <button
              onClick={moveToWishlist}
              className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-surface-alt hover:text-danger"
              aria-label="Move to wishlist"
              title="Move to wishlist"
            >
              <Heart className="size-4" />
            </button>
            <button
              onClick={() => dispatch(removeFromCart(item._id))}
              className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-surface-alt hover:text-danger"
              aria-label="Remove from cart"
              title="Remove"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
