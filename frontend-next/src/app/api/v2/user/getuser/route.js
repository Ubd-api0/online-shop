import { NextResponse } from "next/server";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { findUserById } from "@/lib/data/users";
import { findShopById } from "@/lib/data/shops";

// The ONE session call: the signed-in user, plus the store record when the
// user is the business owner (single Users table — the UI branches on role).
export const GET = withErrorHandling(async () => {
  const authUser = await requireAuth();
  const user = await findUserById(authUser._id);
  if (!user) throw new ApiError("User doesn't exists", 400);
  const shop = user.role === "business_owner" && user.shop ? await findShopById(user.shop) : null;
  return NextResponse.json({ success: true, user, shop });
});
