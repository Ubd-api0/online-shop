# Chat / realtime server

Plain Socket.io server for the store chat (customer ↔ owner).

## Hosting

**Vercel is not a good fit** — serverless functions have no persistent
WebSocket connection and no shared in-memory state, so `users` / rooms break
and messages get dropped. A `vercel.json` is included so it *can* be deployed
there (long-polling only, unreliable), but prefer a host that keeps a process
alive:

- **Render** – New Web Service, root `socket/`, build `npm install`, start `npm start`.
- **Railway / Fly.io / a small VPS** – same idea.

Free tiers on those support WebSockets.

## Env

| var          | example                          | notes                                    |
| ------------ | -------------------------------- | ---------------------------------------- |
| `PORT`       | `4000`                           | host usually injects this                |
| `CLIENT_URL` | `https://my-shop.vercel.app`     | comma-separated; empty = allow any origin |

## Wiring the frontend

Set `REACT_APP_SOCKET_URL` on the Vercel frontend project to this server's URL
(e.g. `https://my-socket.onrender.com`). Local dev falls back to
`http://localhost:4000`.
