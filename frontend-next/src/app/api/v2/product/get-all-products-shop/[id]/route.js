import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { listProductsByShop } from "@/lib/data/products";

export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const products = await listProductsByShop(id);
  return NextResponse.json({ success: true, products }, { status: 201 });
});
