import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { createEvent } from "@/lib/data/events";

export const POST = withErrorHandling(async (request) => {
  const eventData = await request.json();
  const product = await createEvent(eventData);
  return NextResponse.json({ success: true, product }, { status: 201 });
});
