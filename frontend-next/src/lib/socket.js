import { io } from "socket.io-client";
import { publicEnv } from "@/lib/env";

// Created lazily, once, on the client only — never at module scope on the
// server (Next.js can evaluate client-component modules during SSR) and
// never re-created on every render/Fast Refresh, which would leak sockets.
let socket;

export function getSocket() {
  if (typeof window === "undefined") return null;
  // Chat is optional: without NEXT_PUBLIC_SOCKET_URL/PATH the rest of the app
  // keeps working and callers just get no socket.
  if (!process.env.NEXT_PUBLIC_SOCKET_URL || !process.env.NEXT_PUBLIC_SOCKET_PATH) return null;
  if (!socket) {
    socket = io(publicEnv.socketUrl, { path: publicEnv.socketPath, transports: ["websocket", "polling"] });
  }
  return socket;
}
