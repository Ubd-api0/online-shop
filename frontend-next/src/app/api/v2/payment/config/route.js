import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errors";
import { getShopPaymentSettings } from "@/lib/data/payment";

export const GET = withErrorHandling(async () => {
  const shop = await getShopPaymentSettings();
  const gateways = (shop && shop.paymentSettings && shop.paymentSettings.gateways) || {
    stripe: true,
    paypal: true,
    easypaisa: false,
    jazzcash: false,
  };
  return NextResponse.json({
    success: true,
    stripeApiKey: process.env.STRIPE_API_KEY || "",
    paypalClientId: process.env.PAYPAL_CLIENT_ID || "",
    gateways,
    paymentSettings: (shop && shop.paymentSettings) || null,
  });
});
