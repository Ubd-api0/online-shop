"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { PackageCheck, X, Star } from "lucide-react";
import api from "@/lib/axios";
import { getAllOrdersOfUser } from "@/redux/slices/order";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function UserOrderDetails({ orderId }) {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(1);

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  const data = orders?.find((item) => item._id === orderId);

  const reviewHandler = async (type) => {
    const endpoint = type === "product" ? "/product/create-new-review" : "/event/create-new-review-event";
    return api.put(endpoint, {
      user,
      rating,
      comment,
      productId: selectedItem?._id,
      orderId,
    });
  };

  const submitReview = async () => {
    if (rating <= 1) return;
    try {
      const res = await reviewHandler("product");
      toast.success(res.data.message);
      dispatch(getAllOrdersOfUser(user._id));
      setComment("");
      setRating(1);
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  const refundHandler = async () => {
    try {
      const { data: res } = await api.put(`/order/order-refund/${orderId}`, {
        status: "Processing refund",
      });
      toast.success(res.message);
      dispatch(getAllOrdersOfUser(user._id));
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 800px:px-6">
      <div className="flex items-center">
        <PackageCheck className="size-8 text-brand" />
        <h1 className="pl-2 text-2xl font-semibold text-content">Order Details</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-6">
        <h5 className="text-muted">
          Order ID: <span className="font-mono">#{data._id?.slice(0, 8)}</span>
        </h5>
        <h5 className="text-muted">Placed On: {data.createdAt?.slice(0, 10)}</h5>
      </div>

      <div className="mt-8 space-y-4">
        {data.cart.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
              {item.images?.[0] && <Image src={item.images[0]} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex-1">
              <h5 className="text-lg text-content">{item.name}</h5>
              <h5 className="text-muted">
                US${item.discountPrice} x {item.qty}
              </h5>
            </div>
            {!item.isReviewed && data.status === "Delivered" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setOpen(true);
                  setSelectedItem(item);
                }}
              >
                Write a review
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card variant="glass" className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-5">
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-6 text-content" />
              </button>
            </div>
            <h2 className="text-center font-display text-2xl font-medium text-content">Give a Review</h2>

            <div className="mt-6 flex items-center gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-DEFAULT bg-surface-alt">
                {selectedItem?.images?.[0] && (
                  <Image src={selectedItem.images[0]} alt="" fill className="object-cover" />
                )}
              </div>
              <div>
                <div className="text-lg text-content">{selectedItem?.name}</div>
                <h4 className="text-content">
                  US${selectedItem?.discountPrice} x {selectedItem?.qty}
                </h4>
              </div>
            </div>

            <h5 className="mt-6 font-medium text-content">
              Give a Rating <span className="text-red-500">*</span>
            </h5>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
                  <Star className={rating >= i ? "size-6 fill-amber-400 text-amber-400" : "size-6 text-amber-400"} />
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="font-medium text-content">
                Write a Comment <span className="text-sm text-muted">(Optional)</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your product? Write your expression about it!"
                className="mt-2"
              />
            </div>

            <Button onClick={submitReview} disabled={rating <= 1} className="mt-4 w-full">
              Submit
            </Button>
          </Card>
        </div>
      )}

      <div className="mt-6 border-t border-border pt-2 text-right">
        <h5 className="text-content">
          Total Price: <strong>US${data.totalPrice}</strong>
        </h5>
      </div>

      <div className="mt-8 items-start gap-6 800px:flex">
        <div className="w-full 800px:w-[60%]">
          <h4 className="pt-3 text-lg font-semibold text-content">Shipping Address:</h4>
          <p className="pt-2 text-content">
            {data.shippingAddress?.address1} {data.shippingAddress?.address2}
          </p>
          <p className="text-content">{data.shippingAddress?.country}</p>
          <p className="text-content">{data.shippingAddress?.city}</p>
          <p className="text-content">{data.user?.phoneNumber}</p>
        </div>

        <div className="mt-6 w-full 800px:mt-0 800px:w-[40%]">
          <h4 className="pt-3 text-lg text-content">Payment Info:</h4>
          <div className="mt-1 flex items-center gap-2">
            Status: <Badge variant="muted">{data.paymentInfo?.status || "Not Paid"}</Badge>
          </div>
          {data.status === "Delivered" && (
            <Button onClick={refundHandler} variant="outline" className="mt-4">
              Give a Refund
            </Button>
          )}
        </div>
      </div>

      <Link href="/" className="mt-6 inline-block">
        <Button variant="outline">Continue shopping</Button>
      </Link>
    </div>
  );
}
