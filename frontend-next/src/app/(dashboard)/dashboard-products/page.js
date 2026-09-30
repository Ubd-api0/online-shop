import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AllProducts } from "@/components/dashboard/all-products";

export const metadata = { title: "All Products" };

export default function ShopAllProducts() {
  return (
    <DashboardLayout active="products" title="All Products">
      <AllProducts />
    </DashboardLayout>
  );
}
