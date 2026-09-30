import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { listConversationsForMember } from "@/lib/data/conversations";

export const GET = withErrorHandling(async (request, { params }) => {
  await requireSeller();
  const { id } = await params;
  const conversations = await listConversationsForMember(id);
  return NextResponse.json({ success: true, conversations }, { status: 201 });
});
