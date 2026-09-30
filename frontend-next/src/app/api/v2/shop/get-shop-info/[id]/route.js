import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { findShopById } from "@/lib/data/shops";

export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const shop = await findShopById(id);
  return NextResponse.json({ success: true, shop });
});
