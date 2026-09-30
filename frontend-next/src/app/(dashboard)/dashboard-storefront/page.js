import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StorefrontEditor } from "@/components/dashboard/storefront-editor";

export const metadata = { title: "Storefront" };

export default function ShopStorefrontPage() {
  return (
    <DashboardLayout active="storefront" title="Storefront">
      <StorefrontEditor />
    </DashboardLayout>
  );
}
