import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { getPaymentConfig } from "@/lib/data/payment";

export const GET = withErrorHandling(async () => {
  const config = await getPaymentConfig();
  return NextResponse.json({ success: true, ...config });
});
