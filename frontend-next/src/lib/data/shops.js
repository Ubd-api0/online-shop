import connectDB from "@/lib/db/connect";
import Shop from "@/lib/db/models/Shop";
import Category from "@/lib/db/models/Category";
import { ApiError } from "@/lib/api/errors";

export async function findShopById(id) {
  await connectDB();
  return Shop.findById(id);
}

export async function updateShopAvatar(shopId, imageUrl) {
  await connectDB();
  return Shop.findByIdAndUpdate(shopId, { avatar: imageUrl }, { new: true });
}

export async function updateShopInfo(shopId, { name, description, email, address, phoneNumber, zipCode }) {
  await connectDB();
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError("Store not found", 404);

  if (name !== undefined) shop.name = name;
  if (description !== undefined) shop.description = description;
  if (email !== undefined) shop.email = email;
  if (address !== undefined) shop.address = address;
  if (phoneNumber !== undefined) shop.phoneNumber = phoneNumber;
  if (zipCode !== undefined) shop.zipCode = zipCode;
  await shop.save();
  return shop;
}

export async function getStorefront() {
  await connectDB();
  const shop = await Shop.findOne().select(
    "name description email phoneNumber address storefront"
  );
  const categories = await Category.find().sort({ order: 1, createdAt: 1 });
  return {
    name: shop?.name || "Shop",
    description: shop?.description || "",
    email: shop?.email || "",
    phoneNumber: shop?.phoneNumber,
    address: shop?.address,
    hero: shop?.storefront?.hero || {},
    featureTiles: shop?.storefront?.featureTiles || [],
    categories,
  };
}

export async function updateStorefront(shopId, { hero, featureTiles }) {
  await connectDB();
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError("Store not found", 404);

  shop.storefront = shop.storefront || {};
  if (hero && typeof hero === "object") {
    shop.storefront.hero = { ...(shop.storefront.hero || {}), ...hero };
  }
  if (Array.isArray(featureTiles)) {
    shop.storefront.featureTiles = featureTiles
      .filter((t) => t && (t.title || t.description))
      .map((t) => ({
        title: String(t.title || ""),
        description: String(t.description || ""),
        icon: String(t.icon || "truck"),
      }));
  }
  shop.markModified("storefront");
  await shop.save();
  return shop;
}

export async function updatePaymentSettings(shopId, paymentSettings) {
  await connectDB();
  if (!paymentSettings) throw new ApiError("paymentSettings is required", 400);

  const {
    codEnabled,
    onlineFullEnabled,
    partialAdvanceEnabled,
    advancePercent,
    gateways = {},
  } = paymentSettings;

  if (!codEnabled && !onlineFullEnabled && !partialAdvanceEnabled) {
    throw new ApiError("At least one payment method must be enabled", 400);
  }

  const pct = Number(advancePercent);
  if (partialAdvanceEnabled && (!Number.isFinite(pct) || pct < 1 || pct > 100)) {
    throw new ApiError("Advance percent must be between 1 and 100", 400);
  }

  const shop = await Shop.findById(shopId);
  shop.paymentSettings = {
    codEnabled: !!codEnabled,
    onlineFullEnabled: !!onlineFullEnabled,
    partialAdvanceEnabled: !!partialAdvanceEnabled,
    advancePercent: Number.isFinite(pct) ? Math.round(pct) : 20,
    gateways: {
      stripe: !!gateways.stripe,
      paypal: !!gateways.paypal,
      easypaisa: !!gateways.easypaisa,
      jazzcash: !!gateways.jazzcash,
    },
  };
  await shop.save();
  return shop;
}
