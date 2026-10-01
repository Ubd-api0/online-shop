import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth, assertActor } from "@/lib/auth/session";
import { createMessage } from "@/lib/data/messages";
import { assertConversationMember } from "@/lib/data/conversations";

export const POST = withErrorHandling(async (request) => {
  const user = await requireAuth();
  const body = await request.json();
  assertActor(user, body.sender); // can't post as someone else
  await assertConversationMember(body.conversationId, body.sender);
  const message = await createMessage(body);
  return NextResponse.json({ success: true, message }, { status: 201 });
});
