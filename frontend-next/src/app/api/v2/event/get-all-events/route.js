import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { listAllEvents } from "@/lib/data/events";

export const GET = withErrorHandling(async () => {
  const events = await listAllEvents();
  return NextResponse.json({ success: true, events }, { status: 201 });
});
