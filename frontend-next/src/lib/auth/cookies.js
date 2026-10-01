import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "token";
const MAX_AGE_SECONDS = 90 * 24 * 60 * 60; // mirrors old 90-day expiry

export const AUTH_COOKIE = COOKIE_NAME;
export const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
});

export async function setAuthCookie(token) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, authCookieOptions());
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthToken() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

// Port of backend/utils/jwtToken.js `sendToken` — issues a JWT for `user`,
// sets it as the auth cookie, and returns the same { success, user, token }
// response shape the old Express API sent.
export async function issueAuthResponse(user, statusCode = 201) {
  const token = user.getJwtToken();
  await setAuthCookie(token);
  return NextResponse.json({ success: true, user, token }, { status: statusCode });
}
