import { Suspense } from "react";
import { ProfileOrders } from "@/components/profile/profile-orders";

export const metadata = { title: "My Orders" };

export default function ProfileOrdersPage() {
  return (
    <Suspense fallback={null}>
      <ProfileOrders />
    </Suspense>
  );
}
