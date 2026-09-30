import { NextResponse } from "next/server";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { findUserById } from "@/lib/data/users";

export const GET = withErrorHandling(async () => {
  const authUser = await requireAuth();
  const user = await findUserById(authUser._id);
  if (!user) throw new ApiError("User doesn't exists", 400);
  return NextResponse.json({ success: true, user });
});
