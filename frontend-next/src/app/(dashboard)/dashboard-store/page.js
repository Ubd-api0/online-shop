import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StoreProfile } from "@/components/dashboard/store-profile";

export const metadata = { title: "Store Profile" };

export default function StoreProfilePage() {
  return (
    <DashboardLayout active="store" title="Store Profile">
      <StoreProfile />
    </DashboardLayout>
  );
}
