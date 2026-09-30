import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { listAllEventsSorted } from "@/lib/data/events";

export const GET = withErrorHandling(async () => {
  const authUser = await requireAuth();
  requireRole(authUser, "business_owner");
  const events = await listAllEventsSorted();
  return NextResponse.json({ success: true, events }, { status: 201 });
});
