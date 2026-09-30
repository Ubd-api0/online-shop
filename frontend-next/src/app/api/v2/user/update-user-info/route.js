import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { updateUserInfo } from "@/lib/data/users";

export const PUT = withErrorHandling(async (request) => {
  const authUser = await requireAuth();
  const body = await request.json();
  const user = await updateUserInfo(authUser._id, body);
  return NextResponse.json({ success: true, user }, { status: 201 });
});
