import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CreateEventForm } from "@/components/dashboard/create-event";

export const metadata = { title: "Create Event" };

export default function ShopCreateEvents() {
  return (
    <DashboardLayout active="create-event" title="Create Event">
      <CreateEventForm />
    </DashboardLayout>
  );
}
