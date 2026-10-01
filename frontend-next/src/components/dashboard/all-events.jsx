"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Trash2 } from "lucide-react";
import { getAllEventsShop, deleteEvent } from "@/redux/slices/events";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatPrice } from "@/lib/format";

export function AllEvents() {
  const { events } = useSelector((state) => state.events);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) dispatch(getAllEventsShop(seller._id));
  }, [dispatch, seller]);

  const handleDelete = (id) => {
    dispatch(deleteEvent(id)).then(() => dispatch(getAllEventsShop(seller._id)));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Sold</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(events || []).map((item) => (
          <TableRow key={item._id}>
            <TableCell className="max-w-[220px] truncate">{item.name}</TableCell>
            <TableCell>{formatPrice(item.discountPrice)}</TableCell>
            <TableCell>{item.stock}</TableCell>
            <TableCell>{item.sold_out}</TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Link href={`/product/${item._id}?isEvent=true`} className="text-content hover:text-brand">
                  <Eye className="size-[18px]" />
                </Link>
                <button onClick={() => handleDelete(item._id)} className="text-danger hover:text-danger">
                  <Trash2 className="size-[18px]" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {(events || []).length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-muted">
              No events yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
