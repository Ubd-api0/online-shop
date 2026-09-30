"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SellerOrderDetails } from "@/components/dashboard/seller-order-details";

export default function ShopOrderDetailsPage() {
  const { id } = useParams();
  return (
    <DashboardLayout active="orders">
      <SellerOrderDetails orderId={id} />
    </DashboardLayout>
  );
}
