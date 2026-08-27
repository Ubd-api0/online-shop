const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const dotenv = require('dotenv');
const Shop = require('../model/shop');
// config
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3030';

// helper: are the env credentials for a gateway actually filled in?
const hasEasypaisaKeys = () =>
  !!(process.env.EASYPAISA_STORE_ID && process.env.EASYPAISA_API_URL);
const hasJazzcashKeys = () =>
  !!(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD &&
     process.env.JAZZCASH_INTEGERITY_SALT && process.env.JAZZCASH_API_URL);

const mockRedirect = (gateway, { amount, orderRef }) =>
  `${FRONTEND_URL}/payment/mock?gateway=${gateway}` +
  `&orderRef=${encodeURIComponent(orderRef || Date.now())}` +
  `&amount=${encodeURIComponent(amount || 0)}`;

// ===============================
// PUBLIC PAYMENT CONFIG
// ===============================
router.get(
  '/config',
  catchAsyncErrors(async (req, res) => {
    const shop = await Shop.findOne().select('paymentSettings');
    const gateways = (shop && shop.paymentSettings && shop.paymentSettings.gateways) || {
      stripe: true,
      paypal: true,
      easypaisa: false,
      jazzcash: false,
    };
    res.status(200).json({
      success: true,
      stripeApiKey: process.env.STRIPE_API_KEY || '',
      paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
      gateways,
      paymentSettings: (shop && shop.paymentSettings) || null,
    });
  })
);

// kept for backwards compatibility with older frontend builds
router.get(
  '/stripeapikey',
  catchAsyncErrors(async (req, res) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY || '' });
  })
);

// ===============================
// STRIPE
// ===============================
router.post(
  '/process',
  catchAsyncErrors(async (req, res) => {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' },
    });
    res.status(200).json({
      success: true,
      client_secret: myPayment.client_secret,
    });
  })
);

// ===============================
// EASYPAISA
// ===============================
router.post(
  '/easypaisa/initiate',
  catchAsyncErrors(async (req, res) => {
    const { amount, orderRef, customerEmail, customerMobile } = req.body;

    if (!hasEasypaisaKeys()) {
      return res.status(200).json({
        success: true,
        mock: true,
        redirectUrl: mockRedirect('easypaisa', { amount, orderRef }),
        message: 'EasyPaisa credentials not configured — using sandbox mock flow.',
      });
    }

    const payload = {
      storeId: process.env.EASYPAISA_STORE_ID,
      amount,
      postBackURL: process.env.EASYPAISA_CALLBACK_URL,
      orderRefNum: orderRef,
      autoRedirect: 1,
      emailAddr: customerEmail,
      mobileNum: customerMobile,
    };

    const response = await axios.post(process.env.EASYPAISA_API_URL, payload);
    res.status(200).json({
      success: true,
      mock: false,
      redirectUrl: response.data.paymentUrl,
    });
  })
);

// ===============================
// JAZZCASH
// ===============================
router.post(
  '/jazzcash/initiate',
  catchAsyncErrors(async (req, res) => {
    const { amount, orderRef } = req.body;

    if (!hasJazzcashKeys()) {
      return res.status(200).json({
        success: true,
        mock: true,
        redirectUrl: mockRedirect('jazzcash', { amount, orderRef }),
        message: 'JazzCash credentials not configured — using sandbox mock flow.',
      });
    }

    const dateTime = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const expiryDateTime = new Date(Date.now() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14);

    const data = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
      pp_SubMerchantID: '',
      pp_Password: process.env.JAZZCASH_PASSWORD,
      pp_BankID: '',
      pp_ProductID: '',
      pp_TxnRefNo: `T${dateTime}`,
      pp_Amount: `${Math.round(amount * 100)}`,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: dateTime,
      pp_BillReference: orderRef,
      pp_Description: 'Store order payment',
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_ReturnURL: process.env.JAZZCASH_CALLBACK_URL,
      pp_SecureHash: '',
    };

    const sortedString = Object.values(data).filter((v) => v !== '').join('&');
    data.pp_SecureHash = crypto
      .createHmac('sha256', process.env.JAZZCASH_INTEGERITY_SALT)
      .update(sortedString)
      .digest('hex');

    res.status(200).json({
      success: true,
      mock: false,
      paymentData: data,
      paymentUrl: process.env.JAZZCASH_API_URL,
    });
  })
);

// ===============================
// GATEWAY CALLBACK / VERIFY
// ===============================
router.post(
  '/gateway/callback',
  catchAsyncErrors(async (req, res) => {
    // Real providers POST their result here. Left as a normalisation point;
    // order status is confirmed by the client via /gateway/verify for now.
    console.log('[payment callback]', req.body);
    res.status(200).json({ success: true });
  })
);

router.post(
  '/gateway/verify',
  catchAsyncErrors(async (req, res) => {
    // Mock verification — always succeeds. Replace with provider-specific
    // signature/checksum validation once real credentials are added.
    res.status(200).json({
      success: true,
      verified: true,
      transactionId: `MOCK-${req.body.gateway || 'gw'}-${Date.now()}`,
    });
  })
);

module.exports = router;
