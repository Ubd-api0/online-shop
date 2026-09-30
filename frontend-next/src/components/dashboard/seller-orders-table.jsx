"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import { getAllOrdersOfShop } from "@/redux/slices/order";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
          <TableHead>Order ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Items Qty</TableHead>
          <TableHead>Total</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((item) => (
          <TableRow key={item._id}>
            <TableCell className="font-mono text-xs">#{item._id.slice(0, 8)}</TableCell>
            <TableCell>
              <Badge variant={item.status === "Delivered" ? "success" : "warning"}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.cart.length}</TableCell>
            <TableCell>US$ {item.totalPrice}</TableCell>
            <TableCell>
              <Link href={`/order/${item._id}`} className="inline-flex text-brand hover:text-brand-hover">
                <ArrowRight className="size-[18px]" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-muted">
              No orders yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
