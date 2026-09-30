import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";

// kept for backwards compatibility with older frontend builds
export const GET = withErrorHandling(async () => {
  return NextResponse.json({ stripeApikey: process.env.STRIPE_API_KEY || "" });
});
