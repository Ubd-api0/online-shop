"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ArrowLeft, X, Star, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { formatPrice, formatDateTime, shortOrderId } from "@/lib/format";
import { CUSTOMER_CANCELLABLE, STAGE_INFO, statusTone } from "@/lib/orders/status";
import {
  useOrder,
  OrderTimeline,
  ShipmentCard,
  AddressCard,
  PriceBreakdown,
  OrderItems,
} from "@/components/orders/order-parts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const CANCEL_REASONS = [
  "Changed my mind",
  "Found a better price elsewhere",
  "Ordered by mistake",
  "Delivery takes too long",
  "Need to change address / items",
];

export function UserOrderDetails({ orderId }) {
  const { user } = useSelector((state) => state.user);
  const { order, setOrder, error, loading, reload } = useOrder(orderId);

  const [reviewItem, setReviewItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [busy, setBusy] = useState(false);

  const submitReview = async () => {
    try {
      const res = await api.put("/product/create-new-review", {
        user,
        rating,
        comment,
        productId: reviewItem?._id,
        orderId,
      });
      toast.success(res.data.message);
      setReviewItem(null);
      setComment("");
      setRating(5);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    }
  };

  const cancelOrder = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/order/cancel/${orderId}`, { reason: cancelReason });
      setOrder(data.order);
      setCancelOpen(false);
      toast.success("Your order has been cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel this order");
    } finally {
      setBusy(false);
    }
  };

  const requestRefund = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/order/order-refund/${orderId}`);
      setOrder(data.order);
      toast.success("Refund requested");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not request a refund");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="mb-4 text-content">{error || "Order not found"}</p>
        <Link href="/profile/orders">
          <Button variant="outline">Back to my orders</Button>
        </Link>
      </div>
    );
  }

  const info = STAGE_INFO[order.status] || { title: order.status };

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 lg:px-5">
      <Link href="/profile/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-content">
        <ArrowLeft className="size-4" /> My orders
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-content">
            Order <span className="font-mono">{shortOrderId(order._id)}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <Badge variant={statusTone(order.status)} className="px-3 py-1.5 text-sm">
          {info.title}
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          <Card variant="solid" className="p-5">
            <h2 className="mb-5 font-semibold text-content">Tracking</h2>
            <OrderTimeline order={order} />
          </Card>

          <Card variant="solid" className="p-5">
            <h2 className="mb-4 font-semibold text-content">Items</h2>
            <OrderItems
              order={order}
              renderAction={(item) =>
                order.status === "Delivered" && !item.isReviewed ? (
                  <Button size="sm" variant="outline" onClick={() => setReviewItem(item)}>
                    Write a review
                  </Button>
                ) : null
              }
            />
          </Card>

          {(CUSTOMER_CANCELLABLE.includes(order.status) || order.status === "Delivered") && (
            <Card variant="solid" className="flex flex-wrap items-center justify-between gap-3 p-5">
              {CUSTOMER_CANCELLABLE.includes(order.status) ? (
                <>
                  <p className="text-sm text-muted">You can cancel this order until it&apos;s handed to the courier.</p>
                  <Button variant="outline" onClick={() => setCancelOpen(true)} className="text-danger">
                    Cancel order
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted">Something wrong with your order?</p>
                  <Button variant="outline" onClick={requestRefund} disabled={busy}>
                    Request a refund
                  </Button>
                </>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <ShipmentCard order={order} />
          <AddressCard order={order} />
          <PriceBreakdown order={order} />
        </div>
      </div>

      {cancelOpen && (
        <Modal onClose={() => setCancelOpen(false)} title="Cancel this order?">
          <p className="mb-3 text-sm text-muted">Tell us why — it helps us improve.</p>
          <div className="space-y-2">
            {CANCEL_REASONS.map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-content">
                <input
                  type="radio"
                  name="cancel-reason"
                  className="accent-brand"
                  checked={cancelReason === r}
                  onChange={() => setCancelReason(r)}
                />
                {r}
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Keep order
            </Button>
            <Button variant="destructive" onClick={cancelOrder} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Cancel order
            </Button>
          </div>
        </Modal>
      )}

      {reviewItem && (
        <Modal onClose={() => setReviewItem(null)} title="Rate your product">
          <div className="flex items-center gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
              {reviewItem.images?.[0] && <Image src={reviewItem.images[0]} alt="" fill className="object-contain" />}
            </div>
            <div>
              <p className="text-content">{reviewItem.name}</p>
              <p className="text-sm text-muted">
                {formatPrice(reviewItem.discountPrice)} × {reviewItem.qty}
              </p>
            </div>
          </div>
          <div className="mt-5 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
                <Star className={rating >= i ? "size-7 fill-amber-400 text-amber-400" : "size-7 text-amber-400"} />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike? (optional)"
            className="mt-4"
          />
          <Button onClick={submitReview} className="mt-4 w-full">
            Submit review
          </Button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <Card
        variant="solid"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-content">{title}</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="size-5 text-muted hover:text-content" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}
