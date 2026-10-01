import { NextResponse } from "next/server";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { requireAuth } from "@/lib/auth/session";
import { createOrGetConversation } from "@/lib/data/conversations";

export const POST = withErrorHandling(async (request) => {
  const user = await requireAuth();
  const { groupTitle, sellerId } = await request.json();
  if (!groupTitle || !sellerId) throw new ApiError("Missing conversation details", 400);
  // the customer side of the chat is always the signed-in user
  const conversation = await createOrGetConversation({ groupTitle, userId: String(user._id), sellerId });
  return NextResponse.json({ success: true, conversation }, { status: 201 });
});
