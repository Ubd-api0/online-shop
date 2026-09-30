import connectDB from "@/lib/db/connect";
import Shop from "@/lib/db/models/Shop";

export async function getShopPaymentSettings() {
  await connectDB();
  return Shop.findOne().select("paymentSettings");
}

// Mirrors GET /api/v2/payment/config's response shape — used for a
// server-side first-paint fetch (payment/page.js) so the Stripe key doesn't
// need a client round-trip before <Elements> can mount.
export async function getPaymentConfig() {
  const shop = await getShopPaymentSettings();
  const gateways = (shop && shop.paymentSettings && shop.paymentSettings.gateways) || {
    stripe: true,
    paypal: true,
    easypaisa: false,
    jazzcash: false,
  };
  return {
    stripeApiKey: process.env.STRIPE_API_KEY || "",
    paypalClientId: process.env.PAYPAL_CLIENT_ID || "",
    gateways,
    paymentSettings: (shop && shop.paymentSettings) || null,
  };
}
