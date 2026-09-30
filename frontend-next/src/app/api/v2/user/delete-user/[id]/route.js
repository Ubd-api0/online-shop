import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { deleteUserById } from "@/lib/data/users";

export const DELETE = withErrorHandling(async (request, { params }) => {
  const authUser = await requireAuth();
  requireRole(authUser, "business_owner");
  const { id } = await params;
  await deleteUserById(id);
  return NextResponse.json(
    { success: true, message: "User deleted successfully!" },
    { status: 201 }
  );
});
