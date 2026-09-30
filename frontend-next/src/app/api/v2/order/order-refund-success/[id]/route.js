import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { acceptOrderRefund } from "@/lib/data/orders";

export const PUT = withErrorHandling(async (request, { params }) => {
  await requireSeller();
  const { id } = await params;
  const { status } = await request.json();
  await acceptOrderRefund(id, status);
  return NextResponse.json({ success: true, message: "Order Refund successfull!" });
});
