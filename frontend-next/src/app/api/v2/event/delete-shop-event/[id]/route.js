import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { requireSeller } from "@/lib/auth/session";
import { deleteShopEvent } from "@/lib/data/events";

export const DELETE = withErrorHandling(async (request, { params }) => {
  await requireSeller();
  const { id } = await params;
  await deleteShopEvent(id);
  return NextResponse.json(
    { success: true, message: "Event Deleted successfully!" },
    { status: 201 }
  );
});
