import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ShippingSettings } from "@/components/dashboard/shipping-settings";

export const metadata = { title: "Shipping" };

export default function ShippingSettingsPage() {
  return (
    <DashboardLayout active="shipping" title="Shipping & delivery">
      <ShippingSettings />
    </DashboardLayout>
  );
}
