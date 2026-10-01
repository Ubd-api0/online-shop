import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { createProduct } from "@/lib/data/products";
import { refreshStorefront } from "@/lib/revalidate";

export const POST = withErrorHandling(async (request) => {
  const { shop } = await requireSeller();
  const productData = await request.json();
  // always the signed-in owner's store, whatever the body says
  const product = await createProduct({ ...productData, shopId: String(shop._id) });
  refreshStorefront();
  return NextResponse.json({ success: true, product }, { status: 201 });
});
