"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import { getAllOrdersOfShop } from "@/redux/slices/order";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateTime, shortOrderId } from "@/lib/format";
import { statusTone } from "@/lib/orders/status";
import { provinceName } from "@/lib/shipping/pakistan";

const PAY = { cod: "COD", online_full: "Paid", partial_advance: "Advance" };

// `onlyStatuses`: a plain array of status strings to keep — plain data (not a
// function) so this stays passable from a Server Component parent.
export function SellerOrdersTable({ onlyStatuses }) {
  const { orders } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch, seller]);

  const rows = onlyStatuses ? (orders || []).filter((o) => onlyStatuses.includes(o.status)) : orders || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((item) => (
          <TableRow key={item._id}>
            <TableCell>
              <Link href={`/order/${item._id}`} className="font-mono text-xs font-semibold text-content hover:text-brand">
                {shortOrderId(item._id)}
              </Link>
              <div className="text-xs text-muted">{formatDateTime(item.createdAt)}</div>
            </TableCell>
            <TableCell>
              <div className="text-sm text-content">{item.shippingAddress?.fullName || item.user?.name}</div>
              <div className="text-xs text-muted">
                {[item.shippingAddress?.city, provinceName(item.shippingAddress?.province)].filter(Boolean).join(", ")}
              </div>
            </TableCell>
            <TableCell>{item.cart.reduce((s, i) => s + (i.qty || 1), 0)}</TableCell>
            <TableCell className="font-medium">{formatPrice(item.totalPrice)}</TableCell>
            <TableCell>
              <Badge variant="muted">{PAY[item.paymentMethod] || "—"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={statusTone(item.status)}>{item.status}</Badge>
            </TableCell>
            <TableCell>
              <Link href={`/order/${item._id}`} className="inline-flex text-brand hover:text-brand-hover">
                <ArrowRight className="size-[18px]" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center text-muted">
              No orders yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
