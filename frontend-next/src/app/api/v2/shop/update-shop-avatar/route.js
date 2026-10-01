import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { updateShopAvatar } from "@/lib/data/shops";
import { refreshStorefront } from "@/lib/revalidate";

export const PUT = withErrorHandling(async (request) => {
  const { shop } = await requireSeller();
  const body = await request.json();
  const seller = await updateShopAvatar(shop._id, body?.image);
  refreshStorefront();
  return NextResponse.json({ success: true, seller });
});
