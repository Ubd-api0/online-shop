import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { listOrdersForShop } from "@/lib/data/orders";

export const GET = withErrorHandling(async (request, { params }) => {
  const { shopId } = await params;
  const orders = await listOrdersForShop(shopId);
  return NextResponse.json({ success: true, orders });
});
