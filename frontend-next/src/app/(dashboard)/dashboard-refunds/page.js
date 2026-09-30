import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SellerOrdersTable } from "@/components/dashboard/seller-orders-table";

export const metadata = { title: "Refunds" };

export default function ShopAllRefunds() {
  return (
    <DashboardLayout active="refunds" title="Refunds">
      <SellerOrdersTable onlyStatuses={["Processing refund", "Refund Success"]} />
    </DashboardLayout>
  );
}
