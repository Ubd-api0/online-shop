// Every key, URL and path the app talks to comes from the environment
// (.env.local in development, the host's env settings in production — see
// .env.example). Nothing deployment-specific is baked into the code; only
// fixed third-party endpoints keep their official URL as a default.
//
// NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so
// each one must be read as a literal `process.env.NEXT_PUBLIC_X` (never
// `process.env[name]`). Getters keep a missing value from throwing until the
// feature that needs it is actually used.

function required(name, value) {
  if (!value) throw new Error(`Missing environment variable ${name} — set it in .env.local (see .env.example).`);
  return value;
}

const trimSlash = (url) => url.replace(/\/+$/, "");

// Safe to use in client components.
export const publicEnv = {
  get apiUrl() {
    return trimSlash(required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL));
  },
  get socketUrl() {
    return required("NEXT_PUBLIC_SOCKET_URL", process.env.NEXT_PUBLIC_SOCKET_URL);
  },
  get socketPath() {
    return required("NEXT_PUBLIC_SOCKET_PATH", process.env.NEXT_PUBLIC_SOCKET_PATH);
  },
  get cloudinaryCloudName() {
    return required("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  },
  get cloudinaryUploadPreset() {
    return required("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  },
  get cloudinaryFolder() {
    return required("NEXT_PUBLIC_CLOUDINARY_FOLDER", process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER);
  },
  get cloudinaryApiUrl() {
    return trimSlash(process.env.NEXT_PUBLIC_CLOUDINARY_API_URL || "https://api.cloudinary.com/v1_1");
  },
};

// Server only (Route Handlers, Server Components, lib code they call).
export const serverEnv = {
  get frontendUrl() {
    return trimSlash(required("FRONTEND_URL", process.env.FRONTEND_URL));
  },
  get googleAuthUrl() {
    return process.env.GOOGLE_AUTH_URL || "https://accounts.google.com/o/oauth2/v2/auth";
  },
  get googleTokenUrl() {
    return process.env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token";
  },
  get googleUserInfoUrl() {
    return process.env.GOOGLE_USERINFO_URL || "https://openidconnect.googleapis.com/v1/userinfo";
  },
};
