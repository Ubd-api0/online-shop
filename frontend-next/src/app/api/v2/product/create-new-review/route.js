import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { reviewProduct } from "@/lib/data/products";
import { refreshStorefront } from "@/lib/revalidate";

export const PUT = withErrorHandling(async (request) => {
  await requireAuth();
  const body = await request.json();
  await reviewProduct(body);
  refreshStorefront();
  return NextResponse.json({ success: true, message: "Reviwed succesfully!" });
});
