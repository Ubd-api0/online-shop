import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { deleteShopProduct } from "@/lib/data/products";

export const DELETE = withErrorHandling(async (request, { params }) => {
  await requireSeller();
  const { id } = await params;
  await deleteShopProduct(id);
  return NextResponse.json(
    { success: true, message: "Product Deleted successfully!" },
    { status: 201 }
  );
});
