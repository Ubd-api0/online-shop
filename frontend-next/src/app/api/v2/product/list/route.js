import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { queryProducts } from "@/lib/data/products";

// GET /api/v2/product/list?category=&q=&sort=newest|best_selling|price_asc|price_desc&page=1&limit=20
export const GET = withErrorHandling(async (request) => {
  const p = request.nextUrl.searchParams;
  const result = await queryProducts({
    category: p.get("category") || undefined,
    q: p.get("q") || undefined,
    sort: p.get("sort") || undefined,
    page: p.get("page"),
    limit: p.get("limit"),
  });
  return NextResponse.json({ success: true, ...result });
});
