import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { createOrder } from "@/lib/data/orders";

export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  const orders = await createOrder(body);
  return NextResponse.json({ success: true, orders }, { status: 201 });
});
