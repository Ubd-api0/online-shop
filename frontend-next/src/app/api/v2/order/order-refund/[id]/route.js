import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requestOrderRefund } from "@/lib/data/orders";

export const PUT = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const { status } = await request.json();
  const order = await requestOrderRefund(id, status);
  return NextResponse.json({
    success: true,
    order,
    message: "Order Refund Request successfully!",
  });
});
