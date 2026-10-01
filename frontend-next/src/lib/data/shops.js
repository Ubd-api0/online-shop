import { resolveShippingSettings, DEFAULT_SHIPPING, ZONES } from "@/lib/shipping/rates";
import { PROVINCES } from "@/lib/shipping/pakistan";
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

const num = (v, { min = 0, max = 1e7, fallback = 0 } = {}) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export async function getShippingSettings(shopId) {
  await connectDB();
  const shop = await Shop.findById(shopId).lean();
  return resolveShippingSettings(shop?.shippingSettings);
}

export async function updateShippingSettings(shopId, input) {
  await connectDB();
  if (!input) throw new ApiError("shippingSettings is required", 400);
  if (!PROVINCES.some((p) => p.code === input.originProvince)) {
    throw new ApiError("Choose the province you ship from", 400);
  }
  if (!String(input.originCity || "").trim()) throw new ApiError("Choose the city you ship from", 400);

  const d = DEFAULT_SHIPPING;
  const rates = {};
  for (const { key } of ZONES) {
    const r = input.rates?.[key] || {};
    const etaMin = num(r.etaMin, { min: 0, max: 60, fallback: d.rates[key].etaMin });
    rates[key] = {
      firstHalfKg: num(r.firstHalfKg, { fallback: d.rates[key].firstHalfKg }),
      extraHalfKg: num(r.extraHalfKg, { fallback: d.rates[key].extraHalfKg }),
      etaMin,
      etaMax: Math.max(etaMin, num(r.etaMax, { min: 0, max: 60, fallback: d.rates[key].etaMax })),
    };
  }
  const exMin = num(input.express?.etaMin, { min: 0, max: 60, fallback: d.express.etaMin });

  const settings = {
    originProvince: input.originProvince,
    originCity: String(input.originCity).trim(),
    defaultWeightKg: num(input.defaultWeightKg, { min: 0.1, max: 500, fallback: d.defaultWeightKg }),
    remoteProvinces: (input.remoteProvinces || []).filter((c) => PROVINCES.some((p) => p.code === c)),
    rates,
    express: {
      enabled: !!input.express?.enabled,
      multiplier: num(input.express?.multiplier, { min: 1, max: 10, fallback: d.express.multiplier }),
      etaMin: exMin,
      etaMax: Math.max(exMin, num(input.express?.etaMax, { min: 0, max: 60, fallback: d.express.etaMax })),
    },
    freeShippingThreshold: num(input.freeShippingThreshold),
    codFee: num(input.codFee, { max: 100000 }),
  };

  await Shop.findByIdAndUpdate(shopId, { shippingSettings: settings });
  return resolveShippingSettings(settings);
}
