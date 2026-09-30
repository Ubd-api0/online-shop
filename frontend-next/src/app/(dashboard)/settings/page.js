import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ShopSettings } from "@/components/dashboard/shop-settings";

export const metadata = { title: "Settings" };

export default function ShopSettingsPage() {
  return (
    <DashboardLayout active="settings" title="Settings">
      <ShopSettings />
    </DashboardLayout>
  );
}
