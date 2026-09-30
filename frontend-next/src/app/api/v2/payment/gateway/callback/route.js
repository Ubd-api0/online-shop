import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";

// Real providers POST their result here. Left as a normalisation point;
// order status is confirmed by the client via /gateway/verify for now.
//
// NOTE: this handler reads the body as JSON, matching the original Express
// behavior. A real gateway integration that needs HMAC/signature
// verification over the raw request body should use `await request.text()`
// instead — Next.js Route Handlers have no Express-style raw-body
// middleware, so the raw string has to be read explicitly before parsing.
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  console.log("[payment callback]", body);
  return NextResponse.json({ success: true });
});
