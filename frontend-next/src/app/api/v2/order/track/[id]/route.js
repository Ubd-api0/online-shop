import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { getOrderForViewer } from "@/lib/data/orders";

export const GET = withErrorHandling(async (request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const order = await getOrderForViewer(id, user);
  return NextResponse.json({ success: true, order });
});
