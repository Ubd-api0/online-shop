import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { updateOrderStatus } from "@/lib/data/orders";

export const PUT = withErrorHandling(async (request, { params }) => {
  const { shop } = await requireSeller();
  const { id } = await params;
  const { status } = await request.json();
  const order = await updateOrderStatus(id, status, shop._id);
  return NextResponse.json({ success: true, order });
});
