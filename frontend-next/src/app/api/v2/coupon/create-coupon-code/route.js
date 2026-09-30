import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { createCoupon } from "@/lib/data/coupons";

export const POST = withErrorHandling(async (request) => {
  await requireSeller();
  const body = await request.json();
  const coupounCode = await createCoupon(body);
  return NextResponse.json({ success: true, coupounCode }, { status: 201 });
});
