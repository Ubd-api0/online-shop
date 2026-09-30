import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { checkCartAvailability } from "@/lib/data/orders";

export const POST = withErrorHandling(async (request) => {
  const { cart } = await request.json();
  const { ok, issues } = await checkCartAvailability(cart);
  return NextResponse.json({ success: true, ok, issues });
});
