/**
 * Effective payment policy for a cart = store defaults ∩ every product override.
 *
 * A method stays allowed only if it is allowed by the store AND by every product
 * that overrides it. `advancePercent` becomes the strictest (highest) required.
 *
 * @param {object} shop      Shop document (needs `paymentSettings`)
 * @param {Array}  products  Product documents for the items in the cart
 * @returns {{codEnabled:boolean, onlineFullEnabled:boolean, partialAdvanceEnabled:boolean, advancePercent:number, gateways:object}}
 */
function effectivePolicy(shop, products = []) {
  const s = (shop && shop.paymentSettings) || {};
  const base = {
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

  for (const p of products) {
    const o = p && p.paymentOverride;
    if (!o || !o.enabled) continue;
    if (o.codEnabled === false) base.codEnabled = false;
    if (o.onlineFullEnabled === false) base.onlineFullEnabled = false;
    if (o.partialAdvanceEnabled === false) base.partialAdvanceEnabled = false;
    if (typeof o.advancePercent === "number") {
      base.advancePercent = Math.max(
        base.advancePercent,
        clampPercent(o.advancePercent, base.advancePercent)
      );
    }
  }

  return base;
}

function clampPercent(v, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(1, Math.round(n)));
}

/**
 * Is `method` allowed by the given policy?
 * @param {string} method 'cod' | 'online_full' | 'partial_advance'
 */
function isMethodAllowed(policy, method) {
  if (method === "cod") return policy.codEnabled;
  if (method === "online_full") return policy.onlineFullEnabled;
  if (method === "partial_advance") return policy.partialAdvanceEnabled;
  return false;
}

module.exports = { effectivePolicy, isMethodAllowed, clampPercent };
