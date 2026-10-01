import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { createOrder } from "@/lib/data/orders";

export const POST = withErrorHandling(async (request) => {
  const user = await requireAuth();
  const body = await request.json();
  const orders = await createOrder(user, body);
  return NextResponse.json({ success: true, orders }, { status: 201 });
});
