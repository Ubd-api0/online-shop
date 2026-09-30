"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Plus, Minus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { addToCart, removeFromCart } from "@/redux/slices/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function CartDrawer({ open, onOpenChange }) {
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();

  const totalPrice = cart.reduce((acc, item) => acc + item.qty * item.discountPrice, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            <SheetTitle>{cart.length} Items</SheetTitle>
          </div>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted">Cart is empty</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {cart.map((item) => (
                <CartItem key={item._id} data={item} dispatch={dispatch} />
              ))}
            </div>
            <div className="border-t border-border p-4">
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                <Button className="w-full">Checkout (${totalPrice})</Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartItem({ data, dispatch }) {
  const [value, setValue] = useState(data.qty);
  const madeToOrder = data.fulfillment === "made_to_order";

  const increment = () => {
    if (!madeToOrder && data.stock <= value) {
      toast.error("Stock limited");
      return;
    }
    setValue(value + 1);
    dispatch(addToCart({ ...data, qty: value + 1 }));
  };

  const decrement = () => {
    if (value === 1) return;
    setValue(value - 1);
    dispatch(addToCart({ ...data, qty: value - 1 }));
  };

  const totalPrice = data.discountPrice * value;

  return (
    <div className="flex items-center gap-3 border-b border-border p-4">
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

      <div className="flex-1">
        <p className="line-clamp-1 text-sm text-content">{data.name}</p>
        {madeToOrder ? (
          <p className="text-xs text-blue-500">
            Made to order{data.leadTimeDays ? ` · ~${data.leadTimeDays}d` : ""}
          </p>
        ) : (data.stock || 0) < value ? (
          <p className="text-xs text-red-500">Not enough stock</p>
        ) : null}
        <p className="text-xs text-muted">
          ${data.discountPrice} × {value}
        </p>
        <p className="font-bold text-brand">${totalPrice}</p>
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
