# Deploying to Vercel

All three `package.json` files pin `"engines": { "node": "24.x" }` (Vercel's
current supported major). Set the Node.js version in each Vercel project's
Settings → General to **24.x** as well if it isn't picked up automatically.

Three separate Vercel projects from this one repo (set the **Root Directory**
for each in Project Settings → General).

| Project  | Root dir    | Notes                                            |
| -------- | ----------- | ----------------------------------------------- |
| backend  | `backend/`  | Express as a serverless function (`api/index.js`) |
| frontend | `frontend/` | CRA static build + `/api` proxy to the backend  |
| socket   | `socket/`   | ⚠️ see below — prefer Render/Railway            |

---

## 1. Backend (`backend/`)

`vercel.json` rewrites every request to `api/index.js`, which exports the
Express app. `server.js` only calls `app.listen()` when run directly, so it
stays a pure handler on Vercel. `db/Database.js` caches the Mongo connection
across warm invocations.

**Environment variables** (Project Settings → Environment Variables):

```
DB_URL=mongodb+srv://...
JWT_SECRET_KEY=...
JWT_EXPIRES=7d
ACTIVATION_SECRET=...
SMPT_HOST=smtp.gmail.com
SMPT_PORT=465
SMPT_MAIL=...
SMPT_PASSWORD=...
STRIPE_API_KEY=...
STRIPE_SECRET_KEY=...
PAYPAL_CLIENT_ID=...            # optional
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=https://<your-frontend>.vercel.app
FRONTEND_URL=https://<your-frontend>.vercel.app
# EASYPAISA_* / JAZZCASH_*      # leave blank to use the sandbox mock flow
```

After the first deploy, run the one-time store setup **from your machine**
against the same DB (Vercel can't run it):

```bash
cd backend && npm run seed:store
```

## 2. Frontend (`frontend/`)

- Framework preset: **Create React App** (build `npm run build`, output `build`).
- Edit `frontend/vercel.json` and replace `REPLACE-WITH-YOUR-BACKEND` with the
  backend project's domain. This proxies `/api/*` to the backend so the auth
  cookie stays first-party (cross-site cookies are blocked by modern browsers).
- Environment variables:

```
REACT_APP_SOCKET_URL=https://<your-socket-host>      # from step 3
# REACT_APP_API_URL is NOT needed if you use the /api proxy above
```

The frontend defaults `server` to `/api/v2` in production, so the proxy is all
that's required for the API.

## 3. Socket server (`socket/`)

**Socket.io does not run reliably on Vercel** — serverless functions have no
persistent connection and no shared memory, so online-status and message
delivery break. Deploy it on a host that keeps a process running:

**Render** (free): New → Web Service → connect repo → Root Directory `socket`,
Build `npm install`, Start `npm start`. Set:

```
CLIENT_URL=https://<your-frontend>.vercel.app
```

Then put that Render URL into the frontend's `REACT_APP_SOCKET_URL`.

(`socket/vercel.json` + `socket/api/index.js` exist so it *can* be pushed to
Vercel, but expect flaky chat there.)

---

## Local development

```bash
# terminal 1
cd backend && npm run dev          # :8000

# terminal 2
cd socket && npm start             # :4000

# terminal 3
cd frontend && npm start           # :3030
```

Local frontend talks directly to `http://localhost:8000` / `:4000` — no env
vars needed.

---

## Troubleshooting

### `querySrv ENOTFOUND _mongodb._tcp.<cluster>.mongodb.net`  (500 / 503 on every API call)

This is **not an app bug** — Node cannot resolve the MongoDB Atlas hostname, so
no DB query can run. Diagnose it:

```bash
cd backend && npm run db:check
```

Common causes & fixes:

1. **Cluster deleted / paused / renamed.** Open the Atlas dashboard, confirm the
   cluster is running, then **Connect → Drivers** and copy a *fresh* connection
   string into `backend/.env` (`DB_URL=`). Atlas auto-generates the `ygg7wy4`-style
   host; if the project/cluster changed, the old host stops resolving entirely.
2. **Network/DNS blocks SRV lookups** (corporate wifi, some VPNs, a few ISPs).
   Use the **non-SRV** string instead — Atlas → Connect → Drivers → "I am using
   an older driver": `mongodb://host1:27017,host2:27017,host3:27017/shop_db?ssl=true&replicaSet=atlas-xxxx-shard-0&authSource=admin&retryWrites=true&w=majority`
3. **IP not allow-listed.** Atlas → Network Access → add your IP, or `0.0.0.0/0`
   (also required for Vercel/Render since their IPs change).
4. **Just want to develop offline** — run MongoDB locally and set
   `DB_URL=mongodb://127.0.0.1:27017/shop_db`, then `npm run seed:store`.

The backend now returns a clean `503 "Database is unavailable…"` instead of a
raw driver stack when this happens; health checks (`/`, `/test`) stay up.
