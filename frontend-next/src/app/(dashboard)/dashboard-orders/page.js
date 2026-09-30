import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SellerOrdersTable } from "@/components/dashboard/seller-orders-table";

export const metadata = { title: "All Orders" };

export default function ShopAllOrders() {
  return (
    <DashboardLayout active="orders" title="All Orders">
      <SellerOrdersTable />
    </DashboardLayout>
  );
}
