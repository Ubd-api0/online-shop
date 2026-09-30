import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { createProduct } from "@/lib/data/products";

export const POST = withErrorHandling(async (request) => {
  const productData = await request.json();
  const product = await createProduct(productData);
  return NextResponse.json({ success: true, product }, { status: 201 });
});
