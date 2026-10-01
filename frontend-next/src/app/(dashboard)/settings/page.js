import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SettingsTabs, StoreInfoSettings } from "@/components/dashboard/shop-settings";

export const metadata = { title: "Settings — Store info" };

export default function StoreInfoSettingsPage() {
  return (
    <DashboardLayout active="settings" title="Settings">
      <SettingsTabs />
      <StoreInfoSettings />
    </DashboardLayout>
  );
}
