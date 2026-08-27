const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");
const { effectivePolicy, isMethodAllowed } = require("../utils/paymentPolicy");

// create new order
router.post(
  "/create-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        cart,
        shippingAddress,
        user,
        totalPrice,
        paymentInfo = {},
        paymentMethod = "cod",
      } = req.body;

      if (!cart || cart.length === 0) {
        return next(new ErrorHandler("Cart is empty", 400));
      }

      // ---- validate the chosen payment method against store/product criteria ----
      const shop = await Shop.findOne();
      const productIds = [...new Set(cart.map((i) => i._id))];
      const products = await Product.find({ _id: { $in: productIds } });
      const productById = new Map(products.map((p) => [String(p._id), p]));
      const policy = effectivePolicy(shop, products);

      // ---- stock / availability check ----
      let hasMadeToOrder = false;
      for (const item of cart) {
        const product = productById.get(String(item._id));
        if (!product) {
          return next(new ErrorHandler("A product in your cart no longer exists", 400));
        }
        if (product.fulfillment === "made_to_order") {
          hasMadeToOrder = true;
          continue; // always orderable
        }
        if ((product.stock || 0) < item.qty) {
          return next(
            new ErrorHandler(`"${product.name}" is currently unavailable`, 400)
          );
        }
      }

      if (!isMethodAllowed(policy, paymentMethod)) {
        return next(
          new ErrorHandler(
            `Payment method "${paymentMethod}" is not available for this order`,
            400
          )
        );
      }

      // ---- derive amounts server-side (never trust the client math) ----
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
        // cod
        remainingAmount = Math.round(totalPrice);
        paymentStatus = "pending_cod";
      }

      const finalPaymentInfo = {
        id: paymentInfo.id,
        type:
          paymentInfo.type ||
          (paymentMethod === "cod" ? "Cash On Delivery" : "Online"),
        status: paymentInfo.status || paymentStatus,
      };

      //   group cart items by shopId (single-vendor: normally one group)
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

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update order status for seller    ---------------(product)
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      if (req.body.status === "Transferred to delivery partner") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      order.status = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharge = order.totalPrice * 0.1;
        await updateSellerInfo(order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);
        if (!product) return;

        // Made-to-order products are produced per order — never decrement stock.
        if (product.fulfillment !== "made_to_order") {
          product.stock = Math.max(0, (product.stock || 0) - qty);
        }
        product.sold_out += qty;

        await product.save({ validateBeforeSave: false });
      }

      async function updateSellerInfo(amount) {
        const seller = await Shop.findById(req.seller.id);

        seller.availableBalance = amount;

        await seller.save();
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order Refund successfull!",
      });

      if (req.body.status === "Refund Success") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);
        if (!product) return;

        if (product.fulfillment !== "made_to_order") {
          product.stock += qty;
        }
        product.sold_out = Math.max(0, product.sold_out - qty);

        await product.save({ validateBeforeSave: false });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("business_owner"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
