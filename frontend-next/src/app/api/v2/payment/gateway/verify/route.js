import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";

// Mock verification — always succeeds. Replace with provider-specific
// signature/checksum validation once real credentials are added.
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    verified: true,
    transactionId: `MOCK-${body.gateway || "gw"}-${Date.now()}`,
  });
});
