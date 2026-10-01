"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { formatPrice } from "@/lib/format";
import { completeCheckout } from "@/redux/slices/cart";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GATEWAY_LABEL = { easypaisa: "EasyPaisa", jazzcash: "JazzCash" };

export function PaymentMockContent() {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const gateway = params.get("gateway") || "gateway";
  const amount = params.get("amount") || "0";
  const orderRef = params.get("orderRef") || "";

  const orderData = useMemo(() => JSON.parse(localStorage.getItem("latestOrder") || "null"), []);

  const finish = async (outcome) => {
    if (outcome === "fail") {
      toast.error("Payment cancelled");
      router.push("/payment");
      return;
    }
    if (!orderData || !orderData.cart) {
      toast.error("No pending order found");
      router.push("/");
      return;
    }
    setLoading(true);
    try {
      await api.post("/payment/gateway/verify", { gateway, orderRef });
      const method = orderData.paymentMethod || "online_full";
      const { data } = await api.post("/order/create-order", {
        items: orderData.items || orderData.cart,
        shippingAddress: orderData.shippingAddress,
        deliveryOption: orderData.deliveryOption,
        couponCode: orderData.couponCode,
        paymentMethod: method,
        paymentInfo: {
          id: `${gateway}-${orderRef}`,
          type: GATEWAY_LABEL[gateway] || gateway,
          status: method === "partial_advance" ? "advance_paid" : "succeeded",
        },
      });
      dispatch(completeCheckout(orderData));
      toast.success("Payment successful!");
      window.location.assign(`/order/success?id=${data.orders?.[0]?._id || ""}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not complete order");
    } finally {
      setLoading(false);
    }
  };

  const label = GATEWAY_LABEL[gateway] || gateway;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card variant="solid" className="p-6 text-center">
        <h1 className="mb-1 text-xl font-semibold text-content">{label} — Sandbox</h1>
        <p className="mb-6 text-sm text-muted">
          No live {label} credentials are configured yet. This screen simulates the gateway so the
          checkout flow can be tested end to end.
        </p>
        <div className="mb-6 rounded-DEFAULT bg-surface-alt p-4 text-left text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted">Amount</span>
            <span className="font-semibold text-content">{formatPrice(amount)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted">Reference</span>
            <span className="font-mono text-xs text-content">{orderRef}</span>
          </div>
        </div>
        <Button disabled={loading} onClick={() => finish("success")} className="mb-3 w-full bg-green-600 hover:bg-green-700">
          {loading ? "Processing…" : "Simulate successful payment"}
        </Button>
        <Button disabled={loading} onClick={() => finish("fail")} variant="outline" className="w-full">
          Cancel
        </Button>
      </Card>
    </div>
  );
}
