import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireAuth, assertActor } from "@/lib/auth/session";
import { listConversationsForMember } from "@/lib/data/conversations";

export const GET = withErrorHandling(async (request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  assertActor(user, id); // only your own (or your store's) conversations
  const conversations = await listConversationsForMember(id);
  return NextResponse.json({ success: true, conversations }, { status: 201 });
});
