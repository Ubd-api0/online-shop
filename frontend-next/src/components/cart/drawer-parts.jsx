"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ImageOff } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Shared visual building blocks for the cart & wishlist drawers.

export const DRAWER_CLASS = "w-full max-w-md sm:w-[420px]";

export function DrawerTitle({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center gap-2.5 pr-8">
      <span className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon className="size-[18px]" />
      </span>
      <span className="font-display text-lg font-semibold text-content">{title}</span>
      {count > 0 && (
        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-muted">{count}</span>
      )}
    </div>
  );
}

export function DrawerEmpty({ icon: Icon, title, text, onAction }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-brand/10">
        <Icon className="size-11 text-brand" strokeWidth={1.5} />
      </span>
      <p className="mt-2 text-lg font-semibold text-content">{title}</p>
      <p className="text-sm text-muted">{text}</p>
      <Link href="/products" onClick={onAction} className="mt-3">
        <Button>Start shopping</Button>
      </Link>
    </div>
  );
}

export function ItemThumb({ item, onNavigate, dim }) {
  return (
    <Link
      href={`/product/${item._id}`}
      onClick={onNavigate}
      className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-alt"
    >
      {item.images?.[0] ? (
        <Image src={item.images[0]} alt={item.name} fill sizes="80px" className={cn("object-contain", dim && "opacity-50")} />
      ) : (
        <ImageOff className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-muted/50" strokeWidth={1.5} />
      )}
    </Link>
  );
}

export function PriceLine({ item, qty = 1 }) {
  const off = discountPercent(item);
  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5">
      <span className="font-bold text-brand">{formatPrice(item.discountPrice * qty)}</span>
      {off > 0 && (
        <>
          <span className="text-xs text-muted line-through">{formatPrice(item.originalPrice * qty)}</span>
          <span className="text-xs font-medium text-emerald-600">-{off}%</span>
        </>
      )}
    </div>
  );
}

export function QtyStepper({ value, onDec, onInc, max }) {
  return (
    <div className="inline-flex h-8 items-center rounded-full border border-border">
      <button
        onClick={onDec}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className="flex size-8 items-center justify-center rounded-full text-content hover:bg-surface-alt disabled:opacity-30"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-7 text-center text-sm font-medium text-content">{value}</span>
      <button
        onClick={onInc}
        disabled={max != null && value >= max}
        aria-label="Increase quantity"
        className="flex size-8 items-center justify-center rounded-full text-content hover:bg-surface-alt disabled:opacity-30"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
