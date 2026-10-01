import { NextResponse } from "next/server";
import { GOOGLE_STATE_COOKIE, exchangeCodeForProfile, googleRedirectUri, safeNext } from "@/lib/auth/google";
import { findOrCreateGoogleUser } from "@/lib/data/users";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth/cookies";
import { sendWelcomeEmail } from "@/lib/email/send";

// Step 2: Google redirects back here — /auth/callback, the URI registered on
// the Google OAuth client (same tab). Verify state, exchange the
// code, sign the user in and send them back where they started.
export async function GET(request) {
  const url = request.nextUrl;
  const fail = (code) => {
    const res = NextResponse.redirect(new URL(`/login?error=${code}`, request.url));
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  };

  if (url.searchParams.get("error")) return fail("google_cancelled"); // user closed the chooser

  let saved = null;
  try {
    saved = JSON.parse(request.cookies.get(GOOGLE_STATE_COOKIE)?.value || "null");
  } catch {}
  const code = url.searchParams.get("code");
  if (!code || !saved?.state || saved.state !== url.searchParams.get("state")) return fail("google_state");

  try {
    const profile = await exchangeCodeForProfile({ code, redirectUri: googleRedirectUri(request) });
    const { user, created } = await findOrCreateGoogleUser(profile);
    if (created) sendWelcomeEmail(user, url.origin).catch(() => {});

    const dest = safeNext(saved.next) || (user.role === "business_owner" ? "/dashboard" : "/");
    const res = NextResponse.redirect(new URL(dest, request.url));
    res.cookies.set(AUTH_COOKIE, user.getJwtToken(), authCookieOptions());
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  } catch (err) {
    console.error("[google sign-in]", err.message);
    return fail("google_failed");
  }
}
