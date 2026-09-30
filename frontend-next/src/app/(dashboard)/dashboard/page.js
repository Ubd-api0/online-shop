import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";

export const metadata = { title: "Dashboard" };

export default function ShopDashboardPage() {
  return (
    <DashboardLayout active="dashboard" title="Dashboard">
      <DashboardHero />
    </DashboardLayout>
  );
}
