import { NextResponse } from "next/server";

// Fast, optimistic auth gate — only checks whether the `token` cookie is
// present (no JWT verification, no DB hit; that happens in
// requireAuth()/requireSeller() at the actual Route Handler / Server
// Component). Renamed from `middleware.js` in Next.js 16.
export function proxy(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout",
    "/payment",
    "/profile",
    "/inbox",
    "/user/:path*",
    "/dashboard/:path*",
    "/dashboard-create-product",
    "/dashboard-products",
    "/dashboard-create-event",
    "/dashboard-events",
    "/dashboard-coupouns",
    "/dashboard-orders",
    "/dashboard-refunds",
    "/dashboard-customers",
    "/dashboard-messages",
    "/dashboard-categories",
    "/dashboard-storefront",
    "/dashboard-shipping",
    "/settings",
    "/shop/:id",
    "/order/:id",
  ],
};
