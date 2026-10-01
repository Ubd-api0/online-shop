import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { cancelOrderByCustomer } from "@/lib/data/orders";

export const PUT = withErrorHandling(async (request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const { reason } = await request.json().catch(() => ({}));
  const order = await cancelOrderByCustomer(id, user._id, reason);
  return NextResponse.json({ success: true, order, message: "Order cancelled" });
});
