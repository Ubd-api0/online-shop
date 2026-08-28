const express = require('express');
const router = express.Router();
const Shop = require('../model/shop');
const Category = require('../model/category');
const { isSeller } = require('../middleware/auth');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const dotenv = require('dotenv');
dotenv.config();

// Single-vendor: the Shop document is the ONE store's config, not a login.
// It is provisioned once with `npm run seed:store`.

// load the store config (business owner only)
router.get(
  '/getSeller',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const seller = await Shop.findById(req.seller._id);
    if (!seller) return next(new ErrorHandler('Store not found', 404));
    res.status(200).json({ success: true, seller });
  })
);

// clear the auth cookie
router.get(
  '/logout',
  catchAsyncErrors(async (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
    });
    res.status(200).json({ success: true, message: 'Log out successful!' });
  })
);

// public store info by id (shop page / chat)
router.get(
  '/get-shop-info/:id',
  catchAsyncErrors(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    res.status(200).json({ success: true, shop });
  })
);

// update store avatar
router.put(
  '/update-shop-avatar',
  isSeller,
  catchAsyncErrors(async (req, res) => {
    const seller = await Shop.findByIdAndUpdate(
      req.seller._id,
      { avatar: req.body?.image },
      { new: true }
    );
    res.status(200).json({ success: true, seller });
  })
);

// update store profile
router.put(
  '/update-seller-info',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const { name, description, address, phoneNumber, zipCode } = req.body;
    const shop = await Shop.findById(req.seller._id);
    if (!shop) return next(new ErrorHandler('Store not found', 404));

    if (name !== undefined) shop.name = name;
    if (description !== undefined) shop.description = description;
    if (address !== undefined) shop.address = address;
    if (phoneNumber !== undefined) shop.phoneNumber = phoneNumber;
    if (zipCode !== undefined) shop.zipCode = zipCode;
    await shop.save();

    res.status(200).json({ success: true, shop });
  })
);

// public storefront content (hero, feature tiles, categories, basic store info)
router.get(
  '/storefront',
  catchAsyncErrors(async (req, res) => {
    const shop = await Shop.findOne().select(
      'name description phoneNumber address storefront'
    );
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json({
      success: true,
      name: shop?.name || 'Shop',
      description: shop?.description || '',
      phoneNumber: shop?.phoneNumber,
      address: shop?.address,
      hero: shop?.storefront?.hero || {},
      featureTiles: shop?.storefront?.featureTiles || [],
      categories,
    });
  })
);

// update storefront content (business owner)
router.put(
  '/update-storefront',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const { hero, featureTiles } = req.body;
    const shop = await Shop.findById(req.seller._id);
    if (!shop) return next(new ErrorHandler('Store not found', 404));

    shop.storefront = shop.storefront || {};
    if (hero && typeof hero === 'object') {
      shop.storefront.hero = { ...(shop.storefront.hero || {}), ...hero };
    }
    if (Array.isArray(featureTiles)) {
      shop.storefront.featureTiles = featureTiles
        .filter((t) => t && (t.title || t.description))
        .map((t) => ({
          title: String(t.title || ''),
          description: String(t.description || ''),
          icon: String(t.icon || 'truck'),
        }));
    }
    shop.markModified('storefront');
    await shop.save();

    res.status(200).json({ success: true, shop });
  })
);

// update payment criteria (business owner)
router.put(
  '/update-payment-settings',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const { paymentSettings } = req.body;
    if (!paymentSettings) {
      return next(new ErrorHandler('paymentSettings is required', 400));
    }

    const {
      codEnabled,
      onlineFullEnabled,
      partialAdvanceEnabled,
      advancePercent,
      gateways = {},
    } = paymentSettings;

    if (!codEnabled && !onlineFullEnabled && !partialAdvanceEnabled) {
      return next(
        new ErrorHandler('At least one payment method must be enabled', 400)
      );
    }

    const pct = Number(advancePercent);
    if (
      partialAdvanceEnabled &&
      (!Number.isFinite(pct) || pct < 1 || pct > 100)
    ) {
      return next(
        new ErrorHandler('Advance percent must be between 1 and 100', 400)
      );
    }

    const shop = await Shop.findById(req.seller._id);
    shop.paymentSettings = {
      codEnabled: !!codEnabled,
      onlineFullEnabled: !!onlineFullEnabled,
      partialAdvanceEnabled: !!partialAdvanceEnabled,
      advancePercent: Number.isFinite(pct) ? Math.round(pct) : 20,
      gateways: {
        stripe: !!gateways.stripe,
        paypal: !!gateways.paypal,
        easypaisa: !!gateways.easypaisa,
        jazzcash: !!gateways.jazzcash,
      },
    };
    await shop.save();

    res.status(200).json({ success: true, shop });
  })
);

module.exports = router;
