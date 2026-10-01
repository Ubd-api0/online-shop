"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Wallet, ArrowRight, ClipboardList, Package } from "lucide-react";
import { getAllOrdersOfShop } from "@/redux/slices/order";
import { getAllProductsShop } from "@/redux/slices/products";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatPrice } from "@/lib/format";

export function DashboardHero() {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller]);

  const availableBalance = Number(seller?.availableBalance || 0).toFixed(2);
  const latestOrders = (orders || []).slice(0, 10);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 800px:grid-cols-3">
        <Card variant="solid" className="p-5">
          <div className="flex items-center gap-2 text-muted">
            <Wallet className="size-[26px]" />
            <h3>Total Revenue</h3>
          </div>
          <h5 className="mt-2 pl-9 text-2xl font-medium text-content">{formatPrice(availableBalance)}</h5>
          <p className="mt-3 pl-1 text-sm text-muted">from delivered orders</p>
        </Card>

        <Card variant="solid" className="p-5">
          <div className="flex items-center gap-2 text-muted">
            <ClipboardList className="size-[26px]" />
            <h3>All Orders</h3>
          </div>
          <h5 className="mt-2 pl-9 text-2xl font-medium text-content">{orders?.length || 0}</h5>
          <Link href="/dashboard-orders" className="mt-3 block pl-1 text-brand hover:underline">
            View Orders
          </Link>
        </Card>

        <Card variant="solid" className="p-5">
          <div className="flex items-center gap-2 text-muted">
            <Package className="size-[26px]" />
            <h3>All Products</h3>
          </div>
          <h5 className="mt-2 pl-9 text-2xl font-medium text-content">{products?.length || 0}</h5>
          <Link href="/dashboard-products" className="mt-3 block pl-1 text-brand hover:underline">
            View Products
          </Link>
        </Card>
      </div>

      <h3 className="mb-2 mt-8 font-display text-xl text-content">Latest Orders</h3>
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
          {latestOrders.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-mono text-xs">#{item._id.slice(0, 8)}</TableCell>
              <TableCell>
                <Badge variant={item.status === "Delivered" ? "success" : "warning"}>{item.status}</Badge>
              </TableCell>
              <TableCell>{item.cart.reduce((acc, c) => acc + c.qty, 0)}</TableCell>
              <TableCell>{formatPrice(item.totalPrice)}</TableCell>
              <TableCell>
                <Link href={`/order/${item._id}`} className="inline-flex text-brand hover:text-brand-hover">
                  <ArrowRight className="size-[18px]" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {latestOrders.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted">
                No orders yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
