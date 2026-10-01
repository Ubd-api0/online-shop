import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SettingsTabs, PaymentSettings } from "@/components/dashboard/shop-settings";

export const metadata = { title: "Settings — Payments" };

export default function PaymentSettingsPage() {
  return (
    <DashboardLayout active="settings" title="Settings">
      <SettingsTabs />
      <PaymentSettings />
    </DashboardLayout>
  );
}
