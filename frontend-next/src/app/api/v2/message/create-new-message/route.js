import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { createMessage } from "@/lib/data/messages";

export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  const message = await createMessage(body);
  return NextResponse.json({ success: true, message }, { status: 201 });
});
