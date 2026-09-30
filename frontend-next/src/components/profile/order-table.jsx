"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function OrderTable({ rows, track = false }) {
  if (rows.length === 0) {
    return <p className="py-10 text-center text-muted">No orders yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono text-xs">#{row.id.slice(0, 8)}</TableCell>
            <TableCell>
              <Badge variant={row.status === "Delivered" ? "success" : "muted"}>{row.status}</Badge>
            </TableCell>
            <TableCell>{row.itemsQty}</TableCell>
            <TableCell>{row.total}</TableCell>
            <TableCell>
              <Link
                href={track ? `/user/track/order/${row.id}` : `/user/order/${row.id}`}
                className="inline-flex text-brand hover:text-brand-hover"
              >
                {track ? <MapPin className="size-[18px]" /> : <ArrowRight className="size-[18px]" />}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
