// Mirror of backend/utils/paymentPolicy.js — keeps checkout UI in sync with
// what the server will actually accept.

export const clampPercent = (v, fallback) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(1, Math.round(n)));
};

/**
 * @param {object} paymentSettings  shop.paymentSettings (from /payment/config)
 * @param {Array}  cartItems        cart items (may carry paymentOverride)
 */
export const effectivePolicy = (paymentSettings, cartItems = []) => {
  const s = paymentSettings || {};
  const policy = {
    codEnabled: s.codEnabled !== false,
    onlineFullEnabled: s.onlineFullEnabled !== false,
    partialAdvanceEnabled: s.partialAdvanceEnabled === true,
    advancePercent: clampPercent(s.advancePercent, 20),
    gateways: {
      stripe: !!(s.gateways && s.gateways.stripe),
      paypal: !!(s.gateways && s.gateways.paypal),
      easypaisa: !!(s.gateways && s.gateways.easypaisa),
      jazzcash: !!(s.gateways && s.gateways.jazzcash),
    },
  };

  for (const item of cartItems) {
    const o = item && item.paymentOverride;
    if (!o || !o.enabled) continue;
    if (o.codEnabled === false) policy.codEnabled = false;
    if (o.onlineFullEnabled === false) policy.onlineFullEnabled = false;
    if (o.partialAdvanceEnabled === false) policy.partialAdvanceEnabled = false;
    if (typeof o.advancePercent === "number") {
      policy.advancePercent = Math.max(
        policy.advancePercent,
        clampPercent(o.advancePercent, policy.advancePercent)
      );
    }
  }

  return policy;
};

export const PAYMENT_METHODS = [
  { key: "cod", label: "Cash on Delivery", flag: "codEnabled" },
  { key: "online_full", label: "Pay in full online", flag: "onlineFullEnabled" },
  {
    key: "partial_advance",
    label: "Pay advance now, rest on delivery",
    flag: "partialAdvanceEnabled",
  },
];

export const availableMethods = (policy) =>
  PAYMENT_METHODS.filter((m) => policy[m.flag]);
