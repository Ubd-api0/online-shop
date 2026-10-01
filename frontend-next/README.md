# Shop

A single-vendor e-commerce store for Pakistan, built with **Next.js 16** (App Router, React 19), **Tailwind CSS v4**, **Redux Toolkit** and **MongoDB** (Mongoose). The storefront, customer account, checkout and store-owner dashboard are one app; the API lives in Next.js Route Handlers under `src/app/api/v2`.

## Features

- **Storefront** — infinite-scroll product feeds, categories, search & sort, events with countdowns, wishlist
- **Cart & checkout** — select items to buy, Buy Now, saved addresses with Province → City pickers, server-side price quotes, vouchers
- **Delivery** — courier-style rates (weight × zone), express option, free-delivery threshold, COD fee — configured in the dashboard
- **Payments** — Cash on Delivery, full online, partial advance; Stripe, PayPal, EasyPaisa, JazzCash
- **Orders** — status timeline, courier + tracking number, customer cancel & refunds, branded email notifications
- **Accounts** — email sign-up with verification, Google sign-in, profile, address book, messages
- **Dashboard** — orders, products, events, coupons, customers, categories, storefront, shipping and payment settings
- Light & dark themes, mobile-first layouts

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

No MongoDB handy? `npm run db:local` starts a local database (keep it running) — point `DB_URL` at `mongodb://127.0.0.1:27017/shop_db`.

### First-time setup

The store record, the owner login and default categories are created by the store seed script (from the original backend), and demo data can be added with:

```bash
npm run seed:demo            # 56 products + 22 events (tagged demo-seed)
npm run seed:demo -- --clean # remove them again
```

### Configuration

- **Branding & policies** — `src/config/appConfig.js` (store name, logo, currency, return window, support hours)
- **Environment** — see `.env.example`
- **Google sign-in** — add `<your-site>/auth/callback` as an Authorized redirect URI on your Google OAuth client
- **Real-time chat** — requires the separate socket server (`NEXT_PUBLIC_SOCKET_URL`)

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run db:local` | Local MongoDB for development |
| `npm run seed:demo` | Demo products & events |
