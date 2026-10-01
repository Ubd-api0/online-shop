import { NextResponse } from "next/server";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { listOrdersForUser } from "@/lib/data/orders";

export const GET = withErrorHandling(async (request, { params }) => {
  const user = await requireAuth();
  const { userId } = await params;
  // Customers may only list their own orders; the store owner may list anyone's.
  if (String(user._id) !== String(userId) && user.role !== "business_owner") {
    throw new ApiError("Not allowed", 403);
  }
  const orders = await listOrdersForUser(userId);
  return NextResponse.json({ success: true, orders });
});
