// API + socket endpoints — read from env only (see frontend/.env.example).
//
//   REACT_APP_API_URL     e.g. /api/v2 (vercel.json proxy) or https://my-backend.vercel.app/api/v2
//   REACT_APP_SOCKET_URL  e.g. https://my-socket.onrender.com
//   REACT_APP_SOCKET_PATH must match SOCKET_PATH on the socket server

const required = (name, value) => {
  if (!value) throw new Error(`Missing environment variable ${name} — set it in frontend/.env`);
  return value;
};

export const server = required("REACT_APP_API_URL", process.env.REACT_APP_API_URL);

export const socketServer = required("REACT_APP_SOCKET_URL", process.env.REACT_APP_SOCKET_URL);

export const socketPath = required("REACT_APP_SOCKET_PATH", process.env.REACT_APP_SOCKET_PATH);

// Legacy: image paths are stored as absolute Cloudinary URLs, so this stays "".
export const backend_url = process.env.REACT_APP_BACKEND_URL || "";
