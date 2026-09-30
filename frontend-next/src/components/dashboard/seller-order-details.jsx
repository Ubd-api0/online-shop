"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { PackageCheck } from "lucide-react";
import api from "@/lib/axios";
import { getAllOrdersOfShop } from "@/redux/slices/order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NORMAL_STAGES = ["Processing", "Transferred to delivery partner", "Shipping", "Received", "On the way", "Delivered"];
const MADE_TO_ORDER_STAGES = [
  "Processing",
  "Manufacturing",
  "Ready to ship",
  "Transferred to delivery partner",
  "Received",
  "On the way",
  "Delivered",
];
const REFUND_STAGES = ["Processing refund", "Refund Success"];

export function SellerOrderDetails({ orderId }) {
  const { orders } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const router = useRouter();
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (seller?._id) dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch, seller]);

  const data = orders?.find((item) => item._id === orderId);

  useEffect(() => {
    if (data?.status) setStatus(data.status);
  }, [data?.status]);

  const isRefund = data?.status === "Processing refund" || data?.status === "Refund Success";

  const orderUpdateHandler = async () => {
    try {
      await api.put(`/order/update-order-status/${orderId}`, { status });
      toast.success("Order updated!");
      router.push("/dashboard-orders");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const refundOrderUpdateHandler = async () => {
    try {
      await api.put(`/order/order-refund-success/${orderId}`, { status });
      toast.success("Order updated!");
      dispatch(getAllOrdersOfShop(seller._id));
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  if (!data) return null;

  const stages = data.hasMadeToOrder ? MADE_TO_ORDER_STAGES : NORMAL_STAGES;
  const from = Math.max(0, stages.indexOf(data.status));

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center">
          <PackageCheck className="size-8 text-brand" />
          <h1 className="pl-2 text-2xl font-semibold text-content">Order Details</h1>
        </div>
        <Link href="/dashboard-orders">
          <Button variant="outline">Order List</Button>
        </Link>
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
            <div>
              <h5 className="text-lg text-content">{item.name}</h5>
              <h5 className="text-muted">
                US${item.discountPrice} x {item.qty}
              </h5>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-border pt-2 text-right">
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
          <Badge variant="muted" className="mt-1">
            {data.paymentInfo?.status || "Not Paid"}
          </Badge>
        </div>
      </div>

      <h4 className="mt-8 text-lg font-semibold text-content">Order status:</h4>
      {data.hasMadeToOrder && <p className="pt-1 text-sm text-blue-600">This order contains made-to-order items.</p>}

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mt-2 h-11 w-[240px] rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
      >
        {(isRefund ? REFUND_STAGES.slice(REFUND_STAGES.indexOf(data.status)) : stages.slice(from)).map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>

      <div>
        <Button onClick={isRefund ? refundOrderUpdateHandler : orderUpdateHandler} className="mt-5">
          Update Status
        </Button>
      </div>
    </div>
  );
}
