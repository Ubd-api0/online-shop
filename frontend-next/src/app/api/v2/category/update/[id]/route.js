import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { updateCategory } from "@/lib/data/categories";

export const PUT = withErrorHandling(async (request, { params }) => {
  await requireSeller();
  const { id } = await params;
  const body = await request.json();
  const category = await updateCategory(id, body);
  return NextResponse.json({ success: true, category });
});
