import connectDB from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import Event from "@/lib/db/models/Event";
import Shop from "@/lib/db/models/Shop";
import CoupounCode from "@/lib/db/models/CoupounCode";
import { effectivePolicy, availableMethods } from "@/lib/paymentPolicy";
import { resolveShippingSettings, deliveryOptions } from "@/lib/shipping/rates";
import { normalizeAddress } from "@/lib/shipping/pakistan";

// The ONE place an order's price is decided. The checkout page calls it (via
// POST /order/quote) on every change to show a live summary, and createOrder
// calls it again when the order is placed — so whatever the browser sends as
// prices/totals is never trusted. Only product ids + quantities, the address,
// the chosen delivery option, coupon code and payment method are inputs.

const round = (n) => Math.round(Number(n || 0));

async function loadLines(items) {
  const ids = [...new Set((items || []).map((i) => String(i._id)))];
  const [products, events] = await Promise.all([
    Product.find({ _id: { $in: ids } }).lean(),
    Event.find({ _id: { $in: ids } }).lean(),
  ]);
  const byId = new Map([...events, ...products].map((p) => [String(p._id), p]));

  const lines = [];
  const issues = [];
  for (const item of items || []) {
    const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
    const p = byId.get(String(item._id));
    if (!p) {
      issues.push({ _id: item._id, name: item.name || "A product", reason: "no longer available" });
      continue;
    }
    const madeToOrder = p.fulfillment === "made_to_order";
    if (!madeToOrder && (p.stock || 0) < qty) {
      issues.push({
        _id: p._id,
        name: p.name,
        reason: (p.stock || 0) > 0 ? `only ${p.stock} left` : "out of stock",
      });
    }
    lines.push({
      _id: String(p._id),
      name: p.name,
      images: p.images || [],
      discountPrice: Number(p.discountPrice),
      originalPrice: p.originalPrice,
      qty,
      shopId: p.shopId,
      stock: p.stock,
      fulfillment: p.fulfillment || "in_stock",
      leadTimeDays: p.leadTimeDays || 0,
      weightKg: p.weightKg,
      paymentOverride: p.paymentOverride,
      lineTotal: round(Number(p.discountPrice) * qty),
    });
  }
  return { lines, issues };
}

async function applyCoupon(code, lines, subTotal) {
  if (!code) return { discount: 0, coupon: null, couponError: null };
  const coupon = await CoupounCode.findOne({ name: String(code).trim() }).lean();
  if (!coupon) return { discount: 0, coupon: null, couponError: "This voucher code doesn't exist" };

  let eligible = lines.filter((l) => l.shopId === coupon.shopId);
  if (coupon.selectedProduct) {
    eligible = eligible.filter((l) => l.name === coupon.selectedProduct || l._id === coupon.selectedProduct);
  }
  if (eligible.length === 0) {
    return { discount: 0, coupon: null, couponError: "This voucher doesn't apply to the items you're buying" };
  }
  if (coupon.minAmount && subTotal < coupon.minAmount) {
    return { discount: 0, coupon: null, couponError: `Spend at least ${coupon.minAmount} to use this voucher` };
  }
  const eligibleAmount = eligible.reduce((s, l) => s + l.lineTotal, 0);
  let discount = round((eligibleAmount * Number(coupon.value)) / 100);
  if (coupon.maxAmount) discount = Math.min(discount, coupon.maxAmount);
  return {
    discount,
    coupon: { name: coupon.name, value: coupon.value, maxAmount: coupon.maxAmount },
    couponError: null,
  };
}

/**
 * @param {{ items: {_id, qty}[], shippingAddress?, deliveryOption?, couponCode?, paymentMethod? }} input
 */
export async function quoteOrder({ items, shippingAddress, deliveryOption, couponCode, paymentMethod }) {
  await connectDB();
  const shop = await Shop.findOne().lean();
  const settings = resolveShippingSettings(shop?.shippingSettings);

  const { lines, issues } = await loadLines(items);
  const subTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const totalWeight = lines.reduce((s, l) => s + (Number(l.weightKg) || settings.defaultWeightKg) * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  // Made-to-order items ship after they're made, which pushes the ETA out.
  const leadTimeDays = Math.max(0, ...lines.filter((l) => l.fulfillment === "made_to_order").map((l) => l.leadTimeDays));

  const address = shippingAddress ? normalizeAddress(shippingAddress) : null;
  const delivery = address
    ? deliveryOptions({ settings, destination: address, weightKg: totalWeight, subtotal: subTotal, leadTimeDays })
    : null;
  const selected = delivery
    ? delivery.options.find((o) => o.key === deliveryOption) || delivery.options[0]
    : null;
  const shippingFee = selected ? selected.fee : 0;

  const { discount, coupon, couponError } = await applyCoupon(couponCode, lines, subTotal);

  const policy = effectivePolicy(shop?.paymentSettings, lines);
  const methods = availableMethods(policy);
  const method = methods.find((m) => m.key === paymentMethod)?.key || methods[0]?.key || null;
  const codFee = method === "cod" ? round(settings.codFee) : 0;

  const totalPrice = Math.max(0, round(subTotal + shippingFee + codFee - discount));

  // How far the order is from free delivery — shown as a nudge at checkout.
  const freeShippingRemaining =
    settings.freeShippingThreshold > 0 && subTotal < settings.freeShippingThreshold
      ? round(settings.freeShippingThreshold - subTotal)
      : 0;

  return {
    lines,
    issues,
    itemCount,
    subTotal,
    shippingFee,
    codFee,
    discount,
    coupon,
    couponError,
    totalPrice,
    delivery: delivery ? { zone: delivery.zone, weightKg: delivery.weightKg, options: delivery.options } : null,
    selectedDelivery: selected,
    paymentMethod: method,
    methods: methods.map((m) => ({ key: m.key, label: m.label })),
    policy,
    freeShippingThreshold: settings.freeShippingThreshold,
    freeShippingRemaining,
    hasMadeToOrder: lines.some((l) => l.fulfillment === "made_to_order"),
  };
}
