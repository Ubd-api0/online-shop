import connectDB from "@/lib/db/connect";
import Shop from "@/lib/db/models/Shop";

export async function getShopPaymentSettings() {
  await connectDB();
  return Shop.findOne().select("paymentSettings");
}
