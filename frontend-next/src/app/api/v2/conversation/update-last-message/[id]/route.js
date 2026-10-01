import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth, assertActor } from "@/lib/auth/session";
import { updateLastMessage, assertConversationMember } from "@/lib/data/conversations";

export const PUT = withErrorHandling(async (request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const { lastMessage, lastMessageId } = await request.json();
  assertActor(user, lastMessageId);
  await assertConversationMember(id, lastMessageId);
  const conversation = await updateLastMessage(id, { lastMessage, lastMessageId });
  return NextResponse.json({ success: true, conversation }, { status: 201 });
});
