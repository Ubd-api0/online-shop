import connectDB from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Shop from "@/lib/db/models/Shop";
import Product from "@/lib/db/models/Product";
import { ApiError } from "@/lib/api/errors";
import { quoteOrder } from "@/lib/data/checkout";
import { normalizeAddress } from "@/lib/shipping/pakistan";
import { nextStatusesFor, stagesFor, CANCELLED, CUSTOMER_CANCELLABLE } from "@/lib/orders/status";

// Shared stock / availability check for a cart.
// Returns { ok, hasMadeToOrder, issues: [{ name }] }.
export async function checkCartAvailability(cart) {
  await connectDB();
  const issues = [];
  let hasMadeToOrder = false;

  if (!Array.isArray(cart) || cart.length === 0) {
    return { ok: false, hasMadeToOrder, issues: [{ name: "Your cart is empty" }] };
  }

  const productIds = [...new Set(cart.map((i) => i._id))];
  const products = await Product.find({ _id: { $in: productIds } });
  const productById = new Map(products.map((p) => [String(p._id), p]));

  for (const item of cart) {
    const product = productById.get(String(item._id));
    if (!product) {
      issues.push({ name: item.name || "A product in your cart" });
      continue;
    }
    if (product.fulfillment === "made_to_order") {
      hasMadeToOrder = true;
      continue; // always orderable
    }
    if ((product.stock || 0) < item.qty) {
      issues.push({ name: product.name });
    }
  }

  return { ok: issues.length === 0, hasMadeToOrder, issues };
}

const PHONE_RE = /^(\+92|0092|0)?3\d{2}[- ]?\d{7}$/;

function validateAddress(a) {
  const missing = [];
  if (!a?.fullName?.trim()) missing.push("full name");
  if (!a?.phone?.trim()) missing.push("phone number");
  if (!a?.province) missing.push("province");
  if (!a?.city) missing.push("city");
  if (!a?.address1?.trim()) missing.push("address");
  if (missing.length) throw new ApiError(`Please add your ${missing.join(", ")}`, 400);
  if (!PHONE_RE.test(a.phone.replace(/\s/g, ""))) {
    throw new ApiError("Please enter a valid mobile number, e.g. 03XX-XXXXXXX", 400);
  }
}

// `authUser` comes from the session cookie — never from the request body.
// Prices, fees and the total are recomputed by quoteOrder(); the body only
// says WHAT to buy and HOW to deliver/pay.
export async function createOrder(
  authUser,
  { cart, items, shippingAddress, deliveryOption, couponCode, paymentInfo = {}, paymentMethod = "cod" }
) {
  await connectDB();

  const requested = (items || cart || []).map((i) => ({ _id: i._id, qty: i.qty, name: i.name }));
  if (requested.length === 0) throw new ApiError("Cart is empty", 400);

  const address = normalizeAddress(shippingAddress);
  validateAddress(address);

  const quote = await quoteOrder({ items: requested, shippingAddress: address, deliveryOption, couponCode, paymentMethod });

  if (quote.issues.length) {
    throw new ApiError(
      `Currently unavailable: ${quote.issues.map((i) => `${i.name} (${i.reason})`).join(", ")}`,
      400
    );
  }
  if (!quote.selectedDelivery) throw new ApiError("We can't deliver to this address yet", 400);
  if (couponCode && quote.couponError) throw new ApiError(quote.couponError, 400);
  if (quote.paymentMethod !== paymentMethod) {
    throw new ApiError(`Payment method "${paymentMethod}" is not available for this order`, 400);
  }

  const totalPrice = quote.totalPrice;
  let advanceAmount = 0;
  let remainingAmount = 0;
  let paymentStatus;

  if (paymentMethod === "partial_advance") {
    advanceAmount = Math.round((totalPrice * quote.policy.advancePercent) / 100);
    remainingAmount = Math.round(totalPrice - advanceAmount);
    paymentStatus = "advance_paid";
  } else if (paymentMethod === "online_full") {
    paymentStatus = "succeeded";
  } else {
    remainingAmount = totalPrice;
    paymentStatus = "pending_cod";
  }

  const finalPaymentInfo = {
    id: paymentInfo.id,
    type: paymentInfo.type || (paymentMethod === "cod" ? "Cash On Delivery" : "Online"),
    status: paymentInfo.status || paymentStatus,
  };

  const d = quote.selectedDelivery;
  const order = await Order.create({
    // Snapshot of what was bought, at the price charged.
    cart: quote.lines.map(({ lineTotal, stock, paymentOverride, ...line }) => line),
    shippingAddress: address,
    user: {
      _id: String(authUser._id),
      name: authUser.name,
      email: authUser.email,
      phoneNumber: authUser.phoneNumber,
    },
    subTotal: quote.subTotal,
    shippingFee: quote.shippingFee,
    codFee: quote.codFee,
    discount: quote.discount,
    couponCode: quote.coupon?.name,
    totalPrice,
    paymentMethod,
    advanceAmount,
    remainingAmount,
    hasMadeToOrder: quote.hasMadeToOrder,
    paymentInfo: finalPaymentInfo,
    delivery: {
      option: d.key,
      label: d.label,
      zone: quote.delivery.zone,
      weightKg: quote.delivery.weightKg,
      etaFrom: d.etaFrom,
      etaTo: d.etaTo,
    },
    statusHistory: [{ status: "Processing", note: "Order placed", at: new Date() }],
  });

  // Kept as an array: the client and old callers expect `orders`.
  return [order];
}

export async function listOrdersForUser(userId) {
  await connectDB();
  return Order.find({ "user._id": userId }).sort({ createdAt: -1 });
}

export async function listOrdersForShop(shopId) {
  await connectDB();
  return Order.find({ "cart.shopId": shopId }).sort({ createdAt: -1 });
}

async function adjustProductForFulfillment(id, qty) {
  const product = await Product.findById(id);
  if (!product) return;
  // Made-to-order products are produced per order — never decrement stock.
  if (product.fulfillment !== "made_to_order") {
    product.stock = Math.max(0, (product.stock || 0) - qty);
  }
  product.sold_out += qty;
  await product.save({ validateBeforeSave: false });
}

async function restockProductForRefund(id, qty) {
  const product = await Product.findById(id);
  if (!product) return;
  if (product.fulfillment !== "made_to_order") {
    product.stock += qty;
  }
  product.sold_out = Math.max(0, product.sold_out - qty);
  await product.save({ validateBeforeSave: false });
}

const clean = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function updateOrderStatus(orderId, { status, note, courier } = {}, shopId) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found with this id", 400);

  if (courier) {
    order.courier = {
      key: clean(courier.key, 40),
      name: clean(courier.name, 80),
      trackingNumber: clean(courier.trackingNumber, 80),
      trackingUrl: /^https?:\/\//.test(courier.trackingUrl || "") ? clean(courier.trackingUrl, 500) : "",
    };
  }

  const changing = status && status !== order.status;
  const stages = stagesFor(order);
  const handoverIdx = stages.indexOf("Transferred to delivery partner");

  if (changing) {
    if (!nextStatusesFor(order).includes(status)) {
      throw new ApiError(`Can't move an order from "${order.status}" to "${status}"`, 400);
    }

    // Stock leaves the shelf when the parcel is handed over (or at any later
    // stage, if the seller skipped ahead).
    if (status !== CANCELLED && stages.indexOf(status) >= handoverIdx && !order.stockDeducted) {
      for (const item of order.cart) {
        await adjustProductForFulfillment(item._id, item.qty);
      }
      order.stockDeducted = true;
    }

    order.status = status;

    if (status === "Delivered") {
      order.deliveredAt = Date.now();
      order.paymentInfo.status = "Succeeded";
      order.remainingAmount = 0;
      // Single-vendor: full order value is store revenue (no marketplace fee).
      await Shop.findByIdAndUpdate(shopId, { $inc: { availableBalance: order.totalPrice } });
    }
    if (status === CANCELLED) {
      order.cancelledAt = Date.now();
      order.cancelReason = clean(note) || "Cancelled by the store";
      if (order.stockDeducted) {
        for (const item of order.cart) await restockProductForRefund(item._id, item.qty);
        order.stockDeducted = false;
      }
    }
  }

  if (changing || clean(note)) {
    order.statusHistory.push({ status: order.status, note: clean(note), at: new Date() });
  }

  await order.save({ validateBeforeSave: false });
  return order;
}

export async function cancelOrderByCustomer(orderId, userId, reason) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order || String(order.user?._id) !== String(userId)) throw new ApiError("Order not found", 404);
  if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
    throw new ApiError("This order has already been shipped and can't be cancelled", 400);
  }
  order.status = CANCELLED;
  order.cancelledAt = Date.now();
  order.cancelReason = clean(reason) || "Cancelled by customer";
  order.statusHistory.push({ status: CANCELLED, note: order.cancelReason, at: new Date() });
  await order.save({ validateBeforeSave: false });
  return order;
}

// An order as seen by a signed-in viewer: its customer, or the store owner.
export async function getOrderForViewer(orderId, viewer) {
  await connectDB();
  const order = await Order.findById(orderId).catch(() => null);
  if (!order) throw new ApiError("Order not found", 404);
  const isOwner = String(order.user?._id) === String(viewer._id);
  const isSeller = viewer.role === "business_owner";
  if (!isOwner && !isSeller) throw new ApiError("Order not found", 404);
  return order;
}

export async function requestOrderRefund(orderId, userId) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order || String(order.user?._id) !== String(userId)) throw new ApiError("Order not found", 404);

  if (order.status !== "Delivered") throw new ApiError("Only delivered orders can be refunded", 400);
  const status = "Processing refund";
  order.status = status;
  order.statusHistory.push({ status, note: "Refund requested by customer", at: new Date() });
  await order.save({ validateBeforeSave: false });
  return order;
}

export async function acceptOrderRefund(orderId, status) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found with this id", 400);
  if (order.status !== "Processing refund" || status !== "Refund Success") {
    throw new ApiError("Only a requested refund can be marked as refunded", 400);
  }

  order.status = status;
  order.statusHistory.push({ status, note: "Refund completed", at: new Date() });
  await order.save({ validateBeforeSave: false });

  // Put stock back if it was taken off when the parcel shipped. Orders from
  // before the flag existed (no history) were always delivered -> deducted.
  const legacy = (order.statusHistory || []).length <= 2 && !order.subTotal;
  if (order.stockDeducted || legacy) {
    for (const item of order.cart) {
      await restockProductForRefund(item._id, item.qty);
    }
    order.stockDeducted = false;
    await order.save({ validateBeforeSave: false });
  }
  return order;
}
