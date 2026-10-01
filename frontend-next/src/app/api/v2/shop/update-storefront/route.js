import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { updateStorefront } from "@/lib/data/shops";
import { refreshStorefront } from "@/lib/revalidate";

export const PUT = withErrorHandling(async (request) => {
  const { shop } = await requireSeller();
  const body = await request.json();
  const updated = await updateStorefront(shop._id, body);
  refreshStorefront();
  return NextResponse.json({ success: true, shop: updated });
});
