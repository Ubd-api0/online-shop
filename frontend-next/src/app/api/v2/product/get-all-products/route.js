import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { listAllProducts } from "@/lib/data/products";

export const GET = withErrorHandling(async () => {
  const products = await listAllProducts();
  return NextResponse.json({ success: true, products }, { status: 201 });
});
