import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { getShippingSettings, updateShippingSettings } from "@/lib/data/shops";

export const GET = withErrorHandling(async () => {
  const { shop } = await requireSeller();
  return NextResponse.json({ success: true, shippingSettings: await getShippingSettings(shop._id) });
});

export const PUT = withErrorHandling(async (request) => {
  const { shop } = await requireSeller();
  const { shippingSettings } = await request.json();
  const saved = await updateShippingSettings(shop._id, shippingSettings);
  return NextResponse.json({ success: true, shippingSettings: saved });
});
