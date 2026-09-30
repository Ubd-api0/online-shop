import { NextResponse } from "next/server";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { findShopById } from "@/lib/data/shops";

export const GET = withErrorHandling(async () => {
  const { shop } = await requireSeller();
  const seller = await findShopById(shop._id);
  if (!seller) throw new ApiError("Store not found", 404);
  return NextResponse.json({ success: true, seller });
});
