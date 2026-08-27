const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your product name!"],
  },
  description: {
    type: String,
    required: [true, "Please enter your product description!"],
  },
  category: {
    type: String,
    required: [true, "Please enter your product category!"],
  },
  tags: {
    type: String,
  },
  originalPrice: {
    type: Number,
  },
  discountPrice: {
    type: Number,
    required: [true, "Please enter your product price!"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter your product stock!"],
  },
  // How the product is fulfilled:
  //  - in_stock:      sold from existing stock; unavailable when stock <= 0
  //  - made_to_order: manufactured after the order is placed; always orderable
  fulfillment: {
    type: String,
    enum: ["in_stock", "made_to_order"],
    default: "in_stock",
  },
  // Estimated days to manufacture + dispatch a made_to_order product (0 = not shown).
  leadTimeDays: {
    type: Number,
    default: 0,
  },
  images: [
    {
      type: String,
    },
  ],

  reviews: [
    {
      user: {
        type: Object,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      productId: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  ratings: {
    type: Number,
  },
  shopId: {
    type: String,
    required: true,
  },
  shop: {
    type: Object,
    required: true,
  },
  sold_out: {
    type: Number,
    default: 0,
  },
  // Optional per-product payment rules. When `enabled`, these are intersected
  // with the store's paymentSettings for any cart containing this product.
  paymentOverride: {
    enabled: { type: Boolean, default: false },
    codEnabled: { type: Boolean, default: true },
    onlineFullEnabled: { type: Boolean, default: true },
    partialAdvanceEnabled: { type: Boolean, default: true },
    advancePercent: { type: Number, min: 1, max: 100 },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Product", productSchema);
