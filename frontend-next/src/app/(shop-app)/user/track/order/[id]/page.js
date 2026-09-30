"use client";

import { useParams } from "next/navigation";
import { TrackOrderStatus } from "@/components/profile/track-order-status";

export default function TrackOrderPage() {
  const { id } = useParams();
  return <TrackOrderStatus orderId={id} />;
}
