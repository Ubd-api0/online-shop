const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
// config
dotenv.config();

// Single-vendor: this document is the ONE store's configuration.
// It is NOT an authentication identity — all login/auth is on the User model
// (a User with role 'business_owner' whose `shop` points here). The legacy
// email/password fields are kept only so old data doesn't break.
const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your shop name!'],
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    select: false,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
  },
  phoneNumber: {
    type: Number,
  },
  role: {
    type: String,
    default: 'Seller',
  },
  avatar: {
    type: String,
  },
  zipCode: {
    type: Number,
  },
  withdrawMethod: {
    type: Object,
  },
  // Store-wide payment criteria shown to customers at checkout.
  paymentSettings: {
    codEnabled: { type: Boolean, default: true },
    onlineFullEnabled: { type: Boolean, default: true },
    partialAdvanceEnabled: { type: Boolean, default: false },
    advancePercent: { type: Number, default: 20, min: 1, max: 100 },
    gateways: {
      stripe: { type: Boolean, default: true },
      paypal: { type: Boolean, default: true },
      easypaisa: { type: Boolean, default: false },
      jazzcash: { type: Boolean, default: false },
    },
  },
  // Owner-editable storefront content (home page).
  storefront: {
    hero: {
      title: { type: String, default: 'Best Collection for Home Decoration' },
      subtitle: {
        type: String,
        default:
          'Discover modern furniture and decoration items at best prices.',
      },
      ctaText: { type: String, default: 'Shop Now' },
      ctaLink: { type: String, default: '/products' },
      image: { type: String, default: '' },
    },
    featureTiles: {
      type: [
        {
          title: { type: String },
          description: { type: String },
          icon: { type: String, default: 'truck' },
        },
      ],
      default: undefined,
    },
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  transections: [
    {
      amount: { type: Number, required: true },
      status: { type: String, default: 'Processing' },
      createdAt: { type: Date, default: Date.now() },
      updatedAt: { type: Date },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password only if one is actually set/changed (legacy support).
shopSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Shop', shopSchema);
