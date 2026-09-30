import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { deleteUserAddress } from "@/lib/data/users";

export const DELETE = withErrorHandling(async (request, { params }) => {
  const authUser = await requireAuth();
  const { id } = await params;
  const user = await deleteUserAddress(authUser._id, id);
  return NextResponse.json({ success: true, user });
});
