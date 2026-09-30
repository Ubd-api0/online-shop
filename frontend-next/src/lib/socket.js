import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

// Created lazily, once, on the client only — never at module scope on the
// server (Next.js can evaluate client-component modules during SSR) and
// never re-created on every render/Fast Refresh, which would leak sockets.
let socket;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
  }
  return socket;
}
