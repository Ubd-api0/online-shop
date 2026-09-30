import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { deleteCategory } from "@/lib/data/categories";

export const DELETE = withErrorHandling(async (request, { params }) => {
  await requireSeller();
  const { id } = await params;
  await deleteCategory(id);
  return NextResponse.json({ success: true, message: "Category deleted" });
});
