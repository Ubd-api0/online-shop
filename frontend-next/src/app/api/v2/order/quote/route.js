import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { quoteOrder } from "@/lib/data/checkout";

// Live checkout summary: prices, delivery options, voucher, fees and total,
// all computed server-side from product ids + quantities.
export const POST = withErrorHandling(async (request) => {
  const { items, shippingAddress, deliveryOption, couponCode, paymentMethod } = await request.json();
  const quote = await quoteOrder({ items, shippingAddress, deliveryOption, couponCode, paymentMethod });
  return NextResponse.json({ success: true, quote });
});
