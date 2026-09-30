import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { findUserById } from "@/lib/data/users";

export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const user = await findUserById(id);
  return NextResponse.json({ success: true, user }, { status: 201 });
});
