import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CategoryManager } from "@/components/dashboard/category-manager";

export const metadata = { title: "Categories" };

export default function ShopCategoriesPage() {
  return (
    <DashboardLayout active="categories" title="Categories">
      <CategoryManager />
    </DashboardLayout>
  );
}
