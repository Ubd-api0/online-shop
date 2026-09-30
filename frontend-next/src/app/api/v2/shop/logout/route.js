import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { clearAuthCookie } from "@/lib/auth/cookies";

export const GET = withErrorHandling(async () => {
  await clearAuthCookie();
  return NextResponse.json({ success: true, message: "Log out successful!" });
});
