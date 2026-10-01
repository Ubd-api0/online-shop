import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { GOOGLE_STATE_COOKIE, googleAuthUrl, googleConfigured, googleRedirectUri, safeNext } from "@/lib/auth/google";

// Step 1: send the browser (same tab) to Google's account chooser.
export async function GET(request) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_unavailable", request.url));
  }
  const state = crypto.randomBytes(16).toString("hex");
  const next = safeNext(request.nextUrl.searchParams.get("next")) || "";

  const res = NextResponse.redirect(googleAuthUrl({ redirectUri: googleRedirectUri(request), state }));
  // CSRF protection + where to return afterwards; short-lived, httpOnly.
  res.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}
