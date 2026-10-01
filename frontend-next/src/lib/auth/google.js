// Google sign-in — standard OAuth 2.0 authorization-code flow with full-page
// redirects (no popup, no new tab): /login -> Google -> our callback -> back
// to the page the user started from, all in the same tab.

export const GOOGLE_STATE_COOKIE = "g_oauth";

export const googleConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// Must exactly match an "Authorized redirect URI" on the Google OAuth client.
export function googleRedirectUri(request) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  return `${request.nextUrl.origin}/auth/callback`;
}

// Only same-site paths — never an absolute URL (open-redirect protection).
export function safeNext(next) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/api/")) {
    return null;
  }
  if (["/login", "/sign-up", "/auth/callback"].some((p) => next === p || next.startsWith(`${p}?`))) return null;
  return next;
}

export function googleAuthUrl({ redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForProfile({ code, redirectUri }) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.access_token) {
    throw new Error(tokens.error_description || tokens.error || "Token exchange failed");
  }

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileRes.json();
  if (!profileRes.ok || !profile.sub) throw new Error("Could not read your Google profile");
  if (!profile.email || profile.email_verified === false) throw new Error("Your Google email isn't verified");
  return profile; // { sub, email, email_verified, name, picture, ... }
}
