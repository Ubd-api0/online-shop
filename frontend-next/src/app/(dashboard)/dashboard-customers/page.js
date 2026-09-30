import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CustomerList } from "@/components/dashboard/customer-list";

export const metadata = { title: "Customers" };

export default function ShopCustomersPage() {
  return (
    <DashboardLayout active="customers" title="Customers">
      <CustomerList />
    </DashboardLayout>
  );
}
