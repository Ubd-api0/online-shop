import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { updatePaymentSettings } from "@/lib/data/shops";

export const PUT = withErrorHandling(async (request) => {
  const { shop } = await requireSeller();
  const { paymentSettings } = await request.json();
  const updated = await updatePaymentSettings(shop._id, paymentSettings);
  return NextResponse.json({ success: true, shop: updated });
});
