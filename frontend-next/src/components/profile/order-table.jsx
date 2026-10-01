"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, MapPin } from "lucide-react";
import { formatPrice, formatDateTime, formatShortDate, shortOrderId } from "@/lib/format";
import { STAGE_INFO, statusTone, CANCELLED, REFUND_STAGES } from "@/lib/orders/status";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// `orders` is undefined until the first fetch lands — show a skeleton, not "empty".
export function OrderTable({ orders, emptyText = "You haven't placed any orders yet." }) {
  if (orders === undefined) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="h-[130px] animate-pulse rounded-lg bg-surface-alt" />
        ))}
      </div>
    );
  }
  if (!orders.length) {
    return (
      <Card variant="solid" className="flex flex-col items-center gap-3 p-10 text-center">
        <Package className="size-10 text-muted" />
        <p className="text-muted">{emptyText}</p>
        <Link href="/products">
          <Button size="sm">Start shopping</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const open = ![CANCELLED, "Delivered", ...REFUND_STAGES].includes(order.status);
        const qty = order.cart.reduce((s, i) => s + (i.qty || 1), 0);
        return (
          <Card key={order._id} variant="solid" className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-alt/60 px-4 py-3">
              <div className="text-sm">
                <span className="font-mono font-semibold text-content">{shortOrderId(order._id)}</span>
                <span className="block text-xs text-muted sm:ml-2 sm:inline sm:text-sm">{formatDateTime(order.createdAt)}</span>
              </div>
              <Badge variant={statusTone(order.status)}>{STAGE_INFO[order.status]?.title || order.status}</Badge>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex shrink-0 -space-x-3">
                {order.cart.slice(0, 3).map((item, i) => (
                  <div key={i} className="relative size-14 overflow-hidden rounded-DEFAULT border-2 border-surface bg-surface-alt">
                    {item.images?.[0] && <Image src={item.images[0]} alt={item.name} fill className="object-contain" />}
                  </div>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-content">
                  {order.cart[0]?.name}
                  {order.cart.length > 1 ? ` + ${order.cart.length - 1} more` : ""}
                </p>
                <p className="text-xs text-muted">{qty} item(s)</p>
                {open && order.delivery?.etaTo && (
                  <p className="text-xs text-info">
                    Expected {formatShortDate(order.delivery.etaFrom)} – {formatShortDate(order.delivery.etaTo)}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm font-semibold text-content">{formatPrice(order.totalPrice)}</span>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-2.5">
              <Link href={`/user/order/${order._id}`}>
                <Button size="sm" variant="outline">
                  Details
                </Button>
              </Link>
              {open && (
                <Link href={`/user/track/order/${order._id}`}>
                  <Button size="sm">
                    <MapPin /> Track
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
