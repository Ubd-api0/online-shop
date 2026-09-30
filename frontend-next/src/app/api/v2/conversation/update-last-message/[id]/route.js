import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { updateLastMessage } from "@/lib/data/conversations";

export const PUT = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const conversation = await updateLastMessage(id, body);
  return NextResponse.json({ success: true, conversation }, { status: 201 });
});
