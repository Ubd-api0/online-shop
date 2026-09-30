import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { listEventsByShop } from "@/lib/data/events";

export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const events = await listEventsByShop(id);
  return NextResponse.json({ success: true, events }, { status: 201 });
});
