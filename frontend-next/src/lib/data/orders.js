import connectDB from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Shop from "@/lib/db/models/Shop";
import Product from "@/lib/db/models/Product";
import { ApiError } from "@/lib/api/errors";
import { effectivePolicy, isMethodAllowed } from "@/lib/payment/paymentPolicy";

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

export async function createOrder({
  cart,
  shippingAddress,
  user,
  totalPrice,
  paymentInfo = {},
  paymentMethod = "cod",
}) {
  await connectDB();

  if (!cart || cart.length === 0) throw new ApiError("Cart is empty", 400);

  const availability = await checkCartAvailability(cart);
  if (!availability.ok) {
    throw new ApiError(
      `Currently unavailable: ${availability.issues.map((i) => i.name).join(", ")}`,
      400
    );
  }
  const hasMadeToOrder = availability.hasMadeToOrder;

  const shop = await Shop.findOne();
  const productIds = [...new Set(cart.map((i) => i._id))];
  const products = await Product.find({ _id: { $in: productIds } });
  const policy = effectivePolicy(shop, products);

  if (!isMethodAllowed(policy, paymentMethod)) {
    throw new ApiError(
      `Payment method "${paymentMethod}" is not available for this order`,
      400
    );
  }

  let advanceAmount = 0;
  let remainingAmount = 0;
  let paymentStatus;

  if (paymentMethod === "partial_advance") {
    advanceAmount = Math.round((totalPrice * policy.advancePercent) / 100);
    remainingAmount = Math.round(totalPrice - advanceAmount);
    paymentStatus = "advance_paid";
  } else if (paymentMethod === "online_full") {
    paymentStatus = "succeeded";
  } else {
    remainingAmount = Math.round(totalPrice);
    paymentStatus = "pending_cod";
  }

  const finalPaymentInfo = {
    id: paymentInfo.id,
    type: paymentInfo.type || (paymentMethod === "cod" ? "Cash On Delivery" : "Online"),
    status: paymentInfo.status || paymentStatus,
  };

  // group cart items by shopId (single-vendor: normally one group)
  const shopItemsMap = new Map();
  for (const item of cart) {
    const shopId = item.shopId;
    if (!shopItemsMap.has(shopId)) shopItemsMap.set(shopId, []);
    shopItemsMap.get(shopId).push(item);
  }

  const orders = [];
  for (const [, items] of shopItemsMap) {
    const order = await Order.create({
      cart: items,
      shippingAddress,
      user,
      totalPrice,
      paymentMethod,
      advanceAmount,
      remainingAmount,
      hasMadeToOrder,
      paymentInfo: finalPaymentInfo,
    });
    orders.push(order);
  }

  return orders;
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

export async function updateOrderStatus(orderId, status, shopId) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found with this id", 400);

  if (status === "Transferred to delivery partner") {
    for (const item of order.cart) {
      await adjustProductForFulfillment(item._id, item.qty);
    }
  }

  order.status = status;

  if (status === "Delivered") {
    order.deliveredAt = Date.now();
    order.paymentInfo.status = "Succeeded";
    // Single-vendor: full order value is store revenue (no marketplace fee).
    await Shop.findByIdAndUpdate(shopId, { $inc: { availableBalance: order.totalPrice } });
  }

  await order.save({ validateBeforeSave: false });
  return order;
}

export async function requestOrderRefund(orderId, status) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found with this id", 400);

  order.status = status;
  await order.save({ validateBeforeSave: false });
  return order;
}

export async function acceptOrderRefund(orderId, status) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found with this id", 400);

  order.status = status;
  await order.save();

  if (status === "Refund Success") {
    for (const item of order.cart) {
      await restockProductForRefund(item._id, item.qty);
    }
  }
}
