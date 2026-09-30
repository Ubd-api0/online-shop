import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { listCategories } from "@/lib/data/categories";

export const GET = withErrorHandling(async () => {
  const categories = await listCategories();
  return NextResponse.json({ success: true, categories });
});
