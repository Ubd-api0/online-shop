import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { listAllUsers } from "@/lib/data/users";

export const GET = withErrorHandling(async () => {
  const authUser = await requireAuth();
  requireRole(authUser, "business_owner");
  const users = await listAllUsers();
  return NextResponse.json({ success: true, users }, { status: 201 });
});
