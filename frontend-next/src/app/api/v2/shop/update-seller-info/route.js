import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { updateShopInfo } from "@/lib/data/shops";

export const PUT = withErrorHandling(async (request) => {
  const { shop } = await requireSeller();
  const body = await request.json();
  const updated = await updateShopInfo(shop._id, body);
  return NextResponse.json({ success: true, shop: updated });
});
