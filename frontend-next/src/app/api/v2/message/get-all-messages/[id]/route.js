import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { listMessagesForConversation } from "@/lib/data/messages";

export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const messages = await listMessagesForConversation(id);
  return NextResponse.json({ success: true, messages }, { status: 201 });
});
