import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { reviewEvent } from "@/lib/data/events";

export const PUT = withErrorHandling(async (request) => {
  await requireAuth();
  const body = await request.json();
  await reviewEvent(body);
  return NextResponse.json({ success: true, message: "Reviwed succesfully!" });
});
