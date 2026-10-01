import { sameCity } from "./pakistan";

// Courier-style delivery pricing, the way Pakistani couriers (TCS, Leopards,
// M&P, PostEx, Trax…) actually quote: a price for the first 0.5 kg plus a
// price per additional 0.5 kg, varying by how far the parcel travels.
//
//   same_city       origin city == destination city
//   same_province   same province, different city
//   other_province  anywhere else in Pakistan
//   remote          provinces the owner marks remote (GB, AJK, ex-FATA…)
//
// The owner edits all of this in Dashboard → Shipping. Pure function, used
// by both the server (authoritative order total) and nothing else — the
// client always asks the server for a quote.

export const ZONES = [
  { key: "same_city", label: "Within city" },
  { key: "same_province", label: "Within province" },
  { key: "other_province", label: "Other provinces" },
  { key: "remote", label: "Remote areas" },
];

export const DEFAULT_SHIPPING = {
  originCity: "Lahore",
  originProvince: "PB",
  defaultWeightKg: 0.5,
  remoteProvinces: ["GB", "JK", "TA"],
  // PKR. firstHalfKg = price of the first 0.5 kg, extraHalfKg = each further 0.5 kg.
  rates: {
    same_city: { firstHalfKg: 150, extraHalfKg: 60, etaMin: 1, etaMax: 2 },
    same_province: { firstHalfKg: 200, extraHalfKg: 90, etaMin: 2, etaMax: 3 },
    other_province: { firstHalfKg: 250, extraHalfKg: 120, etaMin: 3, etaMax: 5 },
    remote: { firstHalfKg: 350, extraHalfKg: 160, etaMin: 5, etaMax: 8 },
  },
  express: { enabled: true, multiplier: 1.6, etaMin: 1, etaMax: 2 },
  freeShippingThreshold: 0, // 0 = no free shipping
  codFee: 0, // flat fee added to Cash-on-Delivery orders
};

// Merge whatever is stored on the Shop over the defaults, so a half-filled
// settings document (or none at all) still prices every zone.
export function resolveShippingSettings(stored) {
  const s = stored && typeof stored.toObject === "function" ? stored.toObject() : stored || {};
  const rates = {};
  for (const { key } of ZONES) {
    rates[key] = { ...DEFAULT_SHIPPING.rates[key], ...(s.rates?.[key] || {}) };
  }
  return {
    ...DEFAULT_SHIPPING,
    ...s,
    remoteProvinces: Array.isArray(s.remoteProvinces) ? s.remoteProvinces : DEFAULT_SHIPPING.remoteProvinces,
    rates,
    express: { ...DEFAULT_SHIPPING.express, ...(s.express || {}) },
  };
}

export function resolveZone(settings, destination) {
  const province = destination?.province;
  if (!province) return null;
  if (settings.remoteProvinces.includes(province)) return "remote";
  if (province === settings.originProvince) {
    return sameCity(destination.city, settings.originCity) ? "same_city" : "same_province";
  }
  return "other_province";
}

// Couriers bill on 0.5 kg steps, rounded up.
export const billableWeight = (kg) => Math.max(0.5, Math.ceil(Number(kg || 0) * 2) / 2);

export function priceForWeight(rate, kg) {
  const steps = billableWeight(kg) / 0.5;
  return Math.round(Number(rate.firstHalfKg) + (steps - 1) * Number(rate.extraHalfKg));
}

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/**
 * Delivery options for a parcel.
 * @returns {{ zone, weightKg, options: [{ key, label, fee, baseFee, free, etaMin, etaMax, etaFrom, etaTo }] } | null}
 *          null when the destination can't be resolved yet (no province picked).
 */
export function deliveryOptions({ settings, destination, weightKg, subtotal, leadTimeDays = 0, now = new Date() }) {
  const zone = resolveZone(settings, destination);
  if (!zone) return null;

  const rate = settings.rates[zone];
  const free = settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold;
  const standardFee = priceForWeight(rate, weightKg);

  const build = (key, label, baseFee, etaMin, etaMax) => ({
    key,
    label,
    baseFee,
    fee: free && key === "standard" ? 0 : baseFee,
    free: free && key === "standard",
    etaMin: etaMin + leadTimeDays,
    etaMax: etaMax + leadTimeDays,
    etaFrom: addDays(now, etaMin + leadTimeDays).toISOString(),
    etaTo: addDays(now, etaMax + leadTimeDays).toISOString(),
  });

  const options = [build("standard", "Standard Delivery", standardFee, rate.etaMin, rate.etaMax)];

  // Express only makes sense where it is actually faster than standard.
  const ex = settings.express;
  if (ex.enabled && ex.etaMax < rate.etaMax) {
    options.push(
      build("express", "Express Delivery", Math.round(standardFee * Number(ex.multiplier || 1)), ex.etaMin, ex.etaMax)
    );
  }

  return { zone, weightKg: billableWeight(weightKg), options };
}
