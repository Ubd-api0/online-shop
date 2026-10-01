import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { createCategory } from "@/lib/data/categories";
import { refreshStorefront } from "@/lib/revalidate";

export const POST = withErrorHandling(async (request) => {
  await requireSeller();
  const body = await request.json();
  const category = await createCategory(body);
  refreshStorefront();
  return NextResponse.json({ success: true, category }, { status: 201 });
});
