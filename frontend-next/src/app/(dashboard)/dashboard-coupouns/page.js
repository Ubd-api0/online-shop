import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AllCoupons } from "@/components/dashboard/all-coupons";

export const metadata = { title: "Discount Codes" };

export default function ShopAllCoupouns() {
  return (
    <DashboardLayout active="coupons" title="Discount Codes">
      <AllCoupons />
    </DashboardLayout>
  );
}
