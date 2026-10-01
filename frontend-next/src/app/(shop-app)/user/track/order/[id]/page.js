"use client";

import { useParams } from "next/navigation";
import { UserOrderDetails } from "@/components/profile/user-order-details";

export default function TrackOrderPage() {
  const { id } = useParams();
  return <UserOrderDetails orderId={id} />;
}
