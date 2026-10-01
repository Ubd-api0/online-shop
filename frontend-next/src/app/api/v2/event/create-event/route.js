import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { createEvent } from "@/lib/data/events";
import { refreshStorefront } from "@/lib/revalidate";

export const POST = withErrorHandling(async (request) => {
  const { shop } = await requireSeller();
  const eventData = await request.json();
  const product = await createEvent({ ...eventData, shopId: String(shop._id) });
  refreshStorefront();
  return NextResponse.json({ success: true, product }, { status: 201 });
});
