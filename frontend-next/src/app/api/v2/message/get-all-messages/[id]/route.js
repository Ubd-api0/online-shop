import { NextResponse } from "next/server";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { requireAuth, actorIds } from "@/lib/auth/session";
import { listMessagesForConversation } from "@/lib/data/messages";
import { findConversation } from "@/lib/data/conversations";

export const GET = withErrorHandling(async (request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const conversation = await findConversation(id);
  const mine = actorIds(user);
  if (!conversation || !conversation.members.some((m) => mine.includes(String(m)))) {
    throw new ApiError("Conversation not found", 404);
  }
  const messages = await listMessagesForConversation(id);
  return NextResponse.json({ success: true, messages }, { status: 201 });
});
