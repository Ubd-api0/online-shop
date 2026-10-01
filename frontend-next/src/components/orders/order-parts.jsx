"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Truck, XCircle, RotateCcw, CalendarClock } from "lucide-react";
import api from "@/lib/axios";
import { formatPrice, formatDateTime, formatShortDate } from "@/lib/format";
import { stagesFor, STAGE_INFO, CANCELLED, isRefundStatus, REFUND_STAGES } from "@/lib/orders/status";
import { trackingLink } from "@/lib/shipping/couriers";
import { formatAddressLines } from "@/components/address/address-fields";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Loads one order (customer's own, or any order for the store owner).
export function useOrder(orderId) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get(`/order/track/${orderId}`);
      setOrder(data.order);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load this order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { order, setOrder, error, loading, reload };
}

// Latest history entry for a status (orders placed before history existed
// fall back to createdAt for "Processing").
function historyFor(order, status) {
  const entries = (order.statusHistory || []).filter((h) => h.status === status);
  if (entries.length) return entries[entries.length - 1];
  if (status === "Processing") return { at: order.createdAt };
  return null;
}

export function OrderTimeline({ order }) {
  const cancelled = order.status === CANCELLED;
  const refund = isRefundStatus(order.status);

  // Normal flow up to the current point; then the cancel/refund branch.
  let steps = stagesFor(order);
  if (cancelled) {
    const reached = steps.filter((s) => historyFor(order, s) && s !== "Processing");
    steps = ["Processing", ...reached.filter((s) => s !== CANCELLED), CANCELLED];
  } else if (refund) {
    steps = [...steps, ...REFUND_STAGES];
  }
  const currentIdx = steps.indexOf(order.status);

  return (
    <ol className="relative">
      {steps.map((status, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const entry = done || current ? historyFor(order, status) : null;
        const info = STAGE_INFO[status] || { title: status, text: "" };
        const Icon = status === CANCELLED ? XCircle : status.includes("efund") ? RotateCcw : Check;
        const last = i === steps.length - 1;
        return (
          <li key={status} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-0.5",
                  done ? "bg-brand" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                status === CANCELLED && current
                  ? "border-red-500 bg-red-500 text-white"
                  : done || current
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-surface text-transparent"
              )}
            >
              {(done || current) && <Icon className="size-3.5" strokeWidth={3} />}
              {current && status !== CANCELLED && status !== "Delivered" && (
                <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn("font-medium", done || current ? "text-content" : "text-muted")}>{info.title}</p>
              {(current || done) && (
                <p className="text-sm text-muted">{entry?.note && entry.note !== "Order placed" ? entry.note : info.text}</p>
              )}
              {entry?.at && <p className="mt-0.5 text-xs text-muted">{formatDateTime(entry.at)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ShipmentCard({ order }) {
  const c = order.courier;
  const link = trackingLink(c);
  const eta = order.delivery?.etaFrom;
  const closed = ["Delivered", CANCELLED, ...REFUND_STAGES].includes(order.status);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.trackingNumber);
      toast.success("Tracking number copied");
    } catch {}
  };

  return (
    <Card variant="solid" className="p-5">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-content">
        <Truck className="size-5 text-brand" /> Shipment
      </h3>
      {order.delivery?.label && (
        <p className="text-sm text-muted">
          {order.delivery.label}
          {order.delivery.weightKg ? ` · ${order.delivery.weightKg} kg` : ""}
        </p>
      )}
      {eta && !closed && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-content">
          <CalendarClock className="size-4 text-brand" />
          Estimated delivery {formatShortDate(order.delivery.etaFrom)} – {formatShortDate(order.delivery.etaTo)}
        </p>
      )}
      {order.deliveredAt && <p className="mt-2 text-sm text-success">Delivered {formatDateTime(order.deliveredAt)}</p>}

      {c?.trackingNumber || c?.name ? (
        <div className="mt-4 rounded-DEFAULT bg-surface-alt p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Courier</p>
          <p className="font-medium text-content">{c.name || "—"}</p>
          {c.trackingNumber && (
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-content">{c.trackingNumber}</span>
              <button onClick={copy} className="text-muted hover:text-brand" aria-label="Copy tracking number">
                <Copy className="size-4" />
              </button>
            </div>
          )}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              Track on {c.name || "courier"} site <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      ) : (
        !closed && <p className="mt-3 text-sm text-muted">Courier details will appear here once your parcel is dispatched.</p>
      )}
    </Card>
  );
}

export function AddressCard({ order }) {
  const a = order.shippingAddress || {};
  return (
    <Card variant="solid" className="p-5">
      <h3 className="mb-2 font-semibold text-content">Delivery address</h3>
      <p className="text-sm font-medium text-content">{a.fullName || order.user?.name}</p>
      {(a.phone || order.user?.phoneNumber) && <p className="text-sm text-muted">{a.phone || order.user.phoneNumber}</p>}
      {formatAddressLines(a).map((l) => (
        <p key={l} className="text-sm text-muted">
          {l}
        </p>
      ))}
    </Card>
  );
}

const METHOD_LABEL = {
  cod: "Cash on Delivery",
  online_full: "Paid online",
  partial_advance: "Advance + Cash on Delivery",
};

export function PriceBreakdown({ order }) {
  // Orders from before the breakdown existed only have totalPrice.
  const subTotal = order.subTotal || order.cart.reduce((s, i) => s + i.discountPrice * i.qty, 0);
  return (
    <Card variant="solid" className="p-5">
      <h3 className="mb-3 font-semibold text-content">Payment</h3>
      <dl className="space-y-2 text-sm">
        <Line label="Items total" value={formatPrice(subTotal)} />
        <Line label="Delivery fee" value={order.shippingFee ? formatPrice(order.shippingFee) : order.subTotal ? "FREE" : "—"} />
        {order.codFee > 0 && <Line label="COD fee" value={formatPrice(order.codFee)} />}
        {order.discount > 0 && (
          <Line label={`Voucher${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`− ${formatPrice(order.discount)}`} />
        )}
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
          <dt className="text-content">Total</dt>
          <dd className="text-brand">{formatPrice(order.totalPrice)}</dd>
        </div>
      </dl>
      <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
        <Line label="Method" value={METHOD_LABEL[order.paymentMethod] || order.paymentInfo?.type || "—"} />
        {order.advanceAmount > 0 && <Line label="Paid in advance" value={formatPrice(order.advanceAmount)} />}
        {order.remainingAmount > 0 && !["Delivered", CANCELLED, ...REFUND_STAGES].includes(order.status) && (
          <Line label="Due on delivery" value={formatPrice(order.remainingAmount)} strong />
        )}
      </div>
    </Card>
  );
}

function Line({ label, value, strong }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("text-right text-content", strong && "font-semibold")}>{value}</dd>
    </div>
  );
}

export function OrderItems({ order, renderAction }) {
  return (
    <ul className="divide-y divide-border">
      {order.cart.map((item, index) => (
        <li key={index} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
            {item.images?.[0] && <Image src={item.images[0]} alt={item.name} fill className="object-contain" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm text-content">{item.name}</p>
            <p className="text-xs text-muted">
              {formatPrice(item.discountPrice)} × {item.qty}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-semibold text-content">{formatPrice(item.discountPrice * item.qty)}</span>
            {renderAction?.(item)}
          </div>
        </li>
      ))}
    </ul>
  );
}
