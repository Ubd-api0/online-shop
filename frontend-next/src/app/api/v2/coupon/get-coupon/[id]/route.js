import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { listShopCoupons } from "@/lib/data/coupons";

// Note: mirrors the original Express route, which ignores the :id param and
// scopes to the authenticated seller's own shop instead.
export const GET = withErrorHandling(async () => {
  const { shop } = await requireSeller();
  const couponCodes = await listShopCoupons(shop._id.toString());
  return NextResponse.json({ success: true, couponCodes }, { status: 201 });
});
