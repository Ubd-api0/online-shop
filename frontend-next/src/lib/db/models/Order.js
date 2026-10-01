import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  cart: { type: Array, required: true },
  // { fullName, phone, country, province, city, address1, address2, zipCode, addressType }
  shippingAddress: { type: Object, required: true },
  user: { type: Object, required: true },
  // Price breakdown — computed on the server at order time (lib/data/checkout.js),
  // never taken from the client. totalPrice = subTotal + shippingFee + codFee - discount.
  subTotal: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  codFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "Processing" },
  // How the customer chose to pay: 'cod' | 'online_full' | 'partial_advance'
  paymentMethod: { type: String, default: "cod" },
  // True when any cart item is a made_to_order product (drives the order lifecycle).
  hasMadeToOrder: { type: Boolean, default: false },
  // For partial_advance orders (0 for the others).
  advanceAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  paymentInfo: {
    id: { type: String },
    // 'succeeded' | 'advance_paid' | 'pending_cod'
    status: { type: String },
    type: { type: String },
  },
  delivery: {
    option: { type: String }, // 'standard' | 'express'
    label: { type: String },
    zone: { type: String },
    weightKg: { type: Number },
    etaFrom: { type: Date },
    etaTo: { type: Date },
  },
  courier: {
    key: { type: String },
    name: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
  },
  // Every status change, oldest first — drives the tracking timeline.
  statusHistory: [
    {
      status: { type: String },
      note: { type: String },
      at: { type: Date, default: Date.now },
    },
  ],
  // Set once stock has been taken off the shelf for this order (at hand-over
  // to the courier), so cancel/refund know whether to put it back.
  stockDeducted: { type: Boolean, default: false },
  cancelReason: { type: String },
  cancelledAt: { type: Date },
  paidAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
