"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Truck, User } from "lucide-react";
import api from "@/lib/axios";
import { formatDateTime, shortOrderId } from "@/lib/format";
import { nextStatusesFor, STAGE_INFO, statusTone, CANCELLED } from "@/lib/orders/status";
import { COURIERS, courierByKey } from "@/lib/shipping/couriers";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const selectClass =
  "h-11 w-full rounded-DEFAULT border border-border bg-surface px-3 text-sm text-content outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/50";

// Statuses at which the parcel is (or should be) with a courier.
const NEEDS_COURIER = ["Transferred to delivery partner", "Shipping", "Received", "On the way"];

export function SellerOrderDetails({ orderId }) {
  const { order, setOrder, error, loading } = useOrder(orderId);

  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [courierKey, setCourierKey] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    setStatus("");
    setNote("");
    setCourierKey(order.courier?.key || "");
    setCourierName(order.courier?.name || "");
    setTrackingNumber(order.courier?.trackingNumber || "");
    setTrackingUrl(order.courier?.trackingUrl || "");
  }, [order]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }
  if (error || !order) return <p className="py-20 text-center text-content">{error || "Order not found"}</p>;

  const isRefund = order.status === "Processing refund";
  const options = nextStatusesFor(order);
  const showCourier = NEEDS_COURIER.includes(status || order.status) || !!order.courier?.name;

  const save = async () => {
    if (!status && !note.trim() && !courierChanged()) return toast.error("Nothing to update");
    if (status === "Transferred to delivery partner" && !courierKey) {
      return toast.error("Choose the courier you handed the parcel to");
    }
    if (status === CANCELLED && !note.trim()) return toast.error("Add a short reason for the cancellation");
    setSaving(true);
    try {
      const courier = courierKey
        ? {
            key: courierKey,
            name: courierKey === "other" ? courierName : courierByKey(courierKey)?.name,
            trackingNumber,
            trackingUrl,
          }
        : undefined;
      const { data } = isRefund
        ? await api.put(`/order/order-refund-success/${orderId}`, { status })
        : await api.put(`/order/update-order-status/${orderId}`, { status: status || undefined, note, courier });
      if (data.order) setOrder(data.order);
      else setOrder({ ...order, status });
      toast.success("Order updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update the order");
    } finally {
      setSaving(false);
    }
  };

  function courierChanged() {
    const c = order.courier || {};
    return (c.key || "") !== courierKey || (c.trackingNumber || "") !== trackingNumber || (c.trackingUrl || "") !== trackingUrl;
  }

  return (
    <div className="w-full">
      <Link href="/dashboard-orders" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-content">
        <ArrowLeft className="size-4" /> All orders
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-content">
            Order <span className="font-mono">{shortOrderId(order._id)}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <Badge variant={statusTone(order.status)} className="px-3 py-1.5 text-sm">
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          {options.length > 0 && (
            <Card variant="solid" className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-content">
                <Truck className="size-5 text-brand" /> Update order
              </h2>
              {order.hasMadeToOrder && (
                <p className="mb-3 text-sm text-blue-600">This order contains made-to-order items.</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Move to</Label>
                  <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Keep “{order.status}”</option>
                    {options.map((o) => (
                      <option key={o} value={o}>
                        {o === CANCELLED ? "Cancel order" : `${o} — ${STAGE_INFO[o]?.title || ""}`}
                      </option>
                    ))}
                  </select>
                </div>
                {!isRefund && (
                  <div className="space-y-2">
                    <Label>Note for the customer (optional)</Label>
                    <Input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={status === CANCELLED ? "Reason for cancelling" : "e.g. Arrived at Lahore hub"}
                    />
                  </div>
                )}
              </div>

              {!isRefund && showCourier && (
                <div className="mt-4 grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Courier</Label>
                    <select className={selectClass} value={courierKey} onChange={(e) => setCourierKey(e.target.value)}>
                      <option value="">Choose courier</option>
                      {COURIERS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {courierKey === "other" ? (
                    <div className="space-y-2">
                      <Label>Courier name</Label>
                      <Input value={courierName} onChange={(e) => setCourierName(e.target.value)} />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Tracking / CN number</Label>
                      <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. 7723145590" />
                    </div>
                  )}
                  {courierKey === "other" && (
                    <div className="space-y-2">
                      <Label>Tracking / CN number</Label>
                      <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                    </div>
                  )}
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Direct tracking link (optional)</Label>
                    <Input
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      placeholder="https://… — paste the courier's tracking page for this parcel"
                    />
                  </div>
                </div>
              )}

              <Button onClick={save} disabled={saving} className="mt-5" variant={status === CANCELLED ? "destructive" : "solid"}>
                {saving && <Loader2 className="animate-spin" />}
                {status === CANCELLED ? "Cancel order" : "Save update"}
              </Button>
            </Card>
          )}

          <Card variant="solid" className="p-5">
            <h2 className="mb-5 font-semibold text-content">Timeline</h2>
            <OrderTimeline order={order} />
          </Card>

          <Card variant="solid" className="p-5">
            <h2 className="mb-4 font-semibold text-content">Items</h2>
            <OrderItems order={order} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card variant="solid" className="p-5">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-content">
              <User className="size-4 text-brand" /> Customer
            </h3>
            <p className="text-sm text-content">{order.user?.name}</p>
            {order.user?.email && <p className="text-sm text-muted">{order.user.email}</p>}
          </Card>
          <AddressCard order={order} />
          <ShipmentCard order={order} />
          <PriceBreakdown order={order} />
        </div>
      </div>
    </div>
  );
}
