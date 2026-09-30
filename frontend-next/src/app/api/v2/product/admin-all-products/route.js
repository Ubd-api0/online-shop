import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { listAllProducts } from "@/lib/data/products";

export const GET = withErrorHandling(async () => {
  const authUser = await requireAuth();
  requireRole(authUser, "business_owner");
  const products = await listAllProducts();
  return NextResponse.json({ success: true, products }, { status: 201 });
});
