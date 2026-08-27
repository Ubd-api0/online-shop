// API + socket endpoints.
//
// Local dev  -> talks directly to the local backend / socket servers.
// Production -> defaults to a same-origin "/api/v2" path so the auth cookie
//               stays first-party (see frontend/vercel.json, which rewrites
//               /api/* to the deployed backend). Override with env vars if you
//               prefer a direct cross-origin call.
//
//   REACT_APP_API_URL     e.g. https://my-backend.vercel.app/api/v2
//   REACT_APP_SOCKET_URL  e.g. https://my-socket.onrender.com

const isProd = process.env.NODE_ENV === "production";

export const server =
  process.env.REACT_APP_API_URL ||
  (isProd ? "/api/v2" : "http://localhost:8000/api/v2");

export const socketServer =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

// Legacy: image paths are stored as absolute Cloudinary URLs, so this stays "".
export const backend_url = process.env.REACT_APP_BACKEND_URL || "";
