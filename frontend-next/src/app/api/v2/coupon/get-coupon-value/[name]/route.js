import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { findCouponByName } from "@/lib/data/coupons";

export const GET = withErrorHandling(async (request, { params }) => {
  const { name } = await params;
  const couponCode = await findCouponByName(name);
  return NextResponse.json({ success: true, couponCode });
});
