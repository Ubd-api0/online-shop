import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ShopReviews } from "@/components/dashboard/shop-reviews";

export const metadata = { title: "Reviews" };

export default function ShopReviewsPage() {
  return (
    <DashboardLayout active="reviews" title="Reviews">
      <ShopReviews />
    </DashboardLayout>
  );
}
