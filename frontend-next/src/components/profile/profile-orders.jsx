"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfUser } from "@/redux/slices/order";
import { OrderTable } from "@/components/profile/order-table";
import { CANCELLED, REFUND_STAGES } from "@/lib/orders/status";
import { cn } from "@/lib/utils";

const TO_SHIP = ["Processing", "Manufacturing", "Ready to ship"];
const SHIPPED = ["Transferred to delivery partner", "Shipping", "Received", "On the way"];

// Customer-facing order buckets (like Daraz's "To ship / To receive / ...").
export const ORDER_GROUPS = [
  { key: "all", label: "All" },
  { key: "to_ship", label: "To ship" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returns", label: "Returns" },
];

export function groupOf(status) {
  if (TO_SHIP.includes(status)) return "to_ship";
  if (SHIPPED.includes(status)) return "shipped";
  if (status === "Delivered") return "delivered";
  if (status === CANCELLED) return "cancelled";
  if (REFUND_STAGES.includes(status)) return "returns";
  return "to_ship";
}

function useMyOrders() {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  return orders;
}

export function ProfileOrders() {
  const orders = useMyOrders();
  const params = useSearchParams();
  const active = ORDER_GROUPS.some((g) => g.key === params.get("status")) ? params.get("status") : "all";
  const shown = orders && (active === "all" ? orders : orders.filter((o) => groupOf(o.status) === active));

  return (
    <>
      <div className="-mx-3 mb-4 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] 800px:mx-0 800px:px-0">
        {ORDER_GROUPS.map((g) => {
          const count = g.key === "all" ? orders?.length : orders?.filter((o) => groupOf(o.status) === g.key).length;
          return (
            <Link
              key={g.key}
              href={g.key === "all" ? "/profile/orders" : `/profile/orders?status=${g.key}`}
              replace
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active === g.key
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface text-content hover:border-brand/50"
              )}
            >
              {g.label}
              {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
            </Link>
          );
        })}
      </div>
      <OrderTable
        orders={shown}
        emptyText={active === "all" ? "You haven't placed any orders yet." : "No orders here."}
      />
    </>
  );
}

export function ProfileRefunds() {
  const orders = useMyOrders();
  const refundOrders = orders && orders.filter((item) => REFUND_STAGES.includes(item.status));
  return <OrderTable orders={refundOrders} emptyText="No returns or refund requests." />;
}

export function ProfileTrackOrders() {
  const orders = useMyOrders();
  // Only orders still on their way.
  const active = orders && orders.filter((o) => ![CANCELLED, "Delivered", ...REFUND_STAGES].includes(o.status));
  return <OrderTable orders={active} emptyText="No orders on the way right now." />;
}
