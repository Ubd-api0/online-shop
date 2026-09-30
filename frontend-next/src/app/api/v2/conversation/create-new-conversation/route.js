import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { createOrGetConversation } from "@/lib/data/conversations";

export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  const conversation = await createOrGetConversation(body);
  return NextResponse.json({ success: true, conversation }, { status: 201 });
});
