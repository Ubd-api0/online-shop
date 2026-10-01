import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { listOrdersForShop } from "@/lib/data/orders";

// Store owner only — orders contain customer names, addresses and phones.
export const GET = withErrorHandling(async () => {
  const { shop } = await requireSeller();
  const orders = await listOrdersForShop(String(shop._id));
  return NextResponse.json({ success: true, orders });
});
