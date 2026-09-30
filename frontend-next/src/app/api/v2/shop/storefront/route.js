import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { getStorefront } from "@/lib/data/shops";

export const GET = withErrorHandling(async () => {
  const storefront = await getStorefront();
  return NextResponse.json({ success: true, ...storefront });
});
