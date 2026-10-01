import { NextResponse } from "next/server";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { findUserById } from "@/lib/data/users";

// Used by chat to show the other person's name/photo — never their email,
// phone or addresses.
export const GET = withErrorHandling(async (request, { params }) => {
  await requireAuth();
  const { id } = await params;
  const user = await findUserById(id).catch(() => null);
  if (!user) throw new ApiError("User not found", 404);
  return NextResponse.json({ success: true, user: { _id: user._id, name: user.name, avatar: user.avatar } });
});
