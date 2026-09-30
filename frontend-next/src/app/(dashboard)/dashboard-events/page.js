import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AllEvents } from "@/components/dashboard/all-events";

export const metadata = { title: "All Events" };

export default function ShopAllEvents() {
  return (
    <DashboardLayout active="events" title="All Events">
      <AllEvents />
    </DashboardLayout>
  );
}
