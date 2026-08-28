const mongoose = require('mongoose');

// Single-vendor: the ONE store's configuration. Not an authentication
// identity — all login/auth is on the User model (a User with role
// 'business_owner' whose `shop` points here). Provisioned via `npm run seed:store`.
const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your store name!'],
  },
  email: {
    type: String,
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
  avatar: {
    type: String,
  },
  zipCode: {
    type: Number,
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
  // Cumulative revenue from delivered orders.
  availableBalance: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Shop', shopSchema);
