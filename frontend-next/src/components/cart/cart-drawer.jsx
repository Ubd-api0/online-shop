"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, Plus, Minus, X } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

const checkboxClass = "size-4 shrink-0 cursor-pointer accent-brand";

export function CartDrawer({ open, onOpenChange }) {
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  const selected = cart.filter((i) => i.selected);
  const allSelected = cart.length > 0 && selected.length === cart.length;
  const selectedTotal = selected.reduce((acc, item) => acc + item.qty * item.discountPrice, 0);

  const checkout = () => {
    if (selected.length === 0) {
      toast.error("Select at least one item to checkout");
      return;
    }
    // Checkout from the cart always wins over a stale Buy Now left in the session.
    dispatch(clearBuyNow());
    onOpenChange(false);
    router.push("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            <SheetTitle>
              {cart.length} {cart.length === 1 ? "Item" : "Items"}
            </SheetTitle>
          </div>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted">Cart is empty</div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={allSelected}
                  onChange={() => dispatch(setAllCartSelected(!allSelected))}
                />
                Select all
              </label>
              {selected.length > 0 && (
                <button
                  onClick={() => dispatch(removeManyFromCart(selected.map((i) => i._id)))}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove selected ({selected.length})
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.map((item) => (
                <CartItem key={item._id} data={item} dispatch={dispatch} />
              ))}
            </div>

            <div className="space-y-3 border-t border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  Selected: {selected.length} of {cart.length}
                </span>
                <span className="text-base font-bold text-content">{formatPrice(selectedTotal)}</span>
              </div>
              <Button className="w-full" onClick={checkout} disabled={selected.length === 0}>
                {selected.length === 0
                  ? "Select items to checkout"
                  : allSelected
                    ? "Checkout all items"
                    : `Checkout ${selected.length} ${selected.length === 1 ? "item" : "items"}`}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartItem({ data, dispatch }) {
  const value = data.qty;
  const madeToOrder = data.fulfillment === "made_to_order";

  const increment = () => {
    if (!madeToOrder && data.stock <= value) {
      toast.error("Stock limited");
      return;
    }
    dispatch(addToCart({ ...data, qty: value + 1 }));
  };

  const decrement = () => {
    if (value === 1) return;
    dispatch(addToCart({ ...data, qty: value - 1 }));
  };

  const totalPrice = data.discountPrice * value;

  return (
    <div className={`flex items-center gap-3 border-b border-border p-4 ${data.selected ? "" : "opacity-60"}`}>
      <input
        type="checkbox"
        className={checkboxClass}
        checked={!!data.selected}
        onChange={() => dispatch(toggleCartItem(data._id))}
        aria-label={`Select ${data.name}`}
      />

      <div className="flex flex-col items-center gap-1">
        <button
          onClick={increment}
          className="flex size-6 items-center justify-center rounded bg-brand text-white"
        >
          <Plus className="size-3.5" />
        </button>
        <span className="text-sm">{value}</span>
        <button
          onClick={decrement}
          className="flex size-6 items-center justify-center rounded bg-surface-alt text-content"
        >
          <Minus className="size-3.5" />
        </button>
      </div>

      <div className="relative size-[70px] shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
        {data.images?.[0] && (
          <Image src={data.images[0]} alt={data.name} fill className="object-contain" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm text-content">{data.name}</p>
        {madeToOrder ? (
          <p className="text-xs text-blue-500">
            Made to order{data.leadTimeDays ? ` · ~${data.leadTimeDays}d` : ""}
          </p>
        ) : (data.stock || 0) < value ? (
          <p className="text-xs text-red-500">Not enough stock</p>
        ) : null}
        <p className="text-xs text-muted">
          {formatPrice(data.discountPrice)} × {value}
        </p>
        <p className="font-bold text-brand">{formatPrice(totalPrice)}</p>
      </div>

      <button
        onClick={() => dispatch(removeFromCart(data._id))}
        className="text-muted hover:text-content"
        aria-label="Remove"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
