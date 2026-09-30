import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { deleteCoupon } from "@/lib/data/coupons";

export const DELETE = withErrorHandling(async (request, { params }) => {
  await requireSeller();
  const { id } = await params;
  await deleteCoupon(id);
  return NextResponse.json(
    { success: true, message: "Coupon code deleted successfully!" },
    { status: 201 }
  );
});
