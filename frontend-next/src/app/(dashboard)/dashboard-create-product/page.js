import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CreateProductForm } from "@/components/dashboard/create-product";

export const metadata = { title: "Create Product" };

export default function ShopCreateProduct() {
  return (
    <DashboardLayout active="create-product" title="Create Product">
      <CreateProductForm />
    </DashboardLayout>
  );
}
