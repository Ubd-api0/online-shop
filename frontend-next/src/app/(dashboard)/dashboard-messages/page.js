import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardMessages } from "@/components/dashboard/dashboard-messages";

export const metadata = { title: "Shop Inbox" };

export default function ShopInboxPage() {
  return (
    <DashboardLayout active="inbox" title="Shop Inbox">
      <Suspense fallback={null}>
        <DashboardMessages />
      </Suspense>
    </DashboardLayout>
  );
}
