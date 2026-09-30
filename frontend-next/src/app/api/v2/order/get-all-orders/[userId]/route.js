import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { listOrdersForUser } from "@/lib/data/orders";

export const GET = withErrorHandling(async (request, { params }) => {
  const { userId } = await params;
  const orders = await listOrdersForUser(userId);
  return NextResponse.json({ success: true, orders });
});
