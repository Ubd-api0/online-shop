const express = require('express');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const Shop = require('../model/shop');
const User = require('../model/user');
const Category = require('../model/category');
const sendToken = require('../utils/jwtToken');
const { isAuthenticated, isSeller, isAdmin } = require('../middleware/auth');
const { upload } = require('../multer');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const dotenv = require('dotenv');
// config
dotenv.config();

const sendShopToken = require('../utils/shopToken');
const Cloudinary = require('../cloudinary');

// create shop
router.post(
  '/create-shop',
  /* upload.single('file'), */ async (req, res, next) => {
    try {
      // Single-vendor: only one store may ever exist.
      if ((await Shop.countDocuments()) > 0) {
        return next(
          new ErrorHandler('A store already exists for this application', 400)
        );
      }

      const { email, file } = req.body;
      const sellerEmail = await Shop.findOne({ email });

      if (sellerEmail) {
        /* const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: 'Error deleting file' });
          }
        }); */
        return next(new ErrorHandler('User already exists', 400));
      }

      /* const filename = req.file.filename;
      const fileUrl = path.join(filename); */

      /* console.log('creating');
      let fileUrl = '';
      if (file) {
        console.log('file uploading');
        fileUrl = await Cloudinary.upload(file, 'avatar', {
          height: 160,
          width: 160,
        });
        console.log('file uploaded: ', fileUrl);
      } */

      const seller = {
        name: req.body.name,
        email: email,
        password: req.body.password,
        avatar: file,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipCode: req.body.zipCode,
      };

      const activationToken = createActivationToken(seller);

      const origin = req.headers.origin;
      const activationUrl = `${origin}/seller/activation/${activationToken}`;

      try {
        await sendMail({
          email: seller.email,
          subject: 'Activate your Shop',
          message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `please check your email:- ${seller.email} to activate your shop!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: '5m',
  });
};

// activate user
router.post(
  '/activation',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler('Invalid token', 400));
      }

      // Single-vendor: refuse if a store already exists.
      if ((await Shop.countDocuments()) > 0) {
        return next(new ErrorHandler('A store already exists', 400));
      }

      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler('User already exists', 400));
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      // Link (or create) the business-owner user account for this store.
      let owner = await User.findOne({ email });
      if (owner) {
        owner.role = 'business_owner';
        owner.shop = seller._id;
        await owner.save();
      } else {
        owner = await User.create({
          name,
          email,
          password,
          avatar,
          phoneNumber,
          role: 'business_owner',
          shop: seller._id,
        });
      }

      // Issue the *user* token so the owner is authenticated as their user account.
      sendToken(owner, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// whether the single store has been set up yet (used by the frontend to gate /shop-create)
router.get(
  '/exists',
  catchAsyncErrors(async (req, res, next) => {
    const count = await Shop.countDocuments();
    res.status(200).json({ success: true, exists: count > 0 });
  })
);

// login shop (deprecated in single-vendor mode — owners log in via /user/login-user)
router.post(
  '/login-shop',
  catchAsyncErrors(async (req, res, next) => {
    return next(
      new ErrorHandler(
        'Shop login is disabled. Please sign in with your owner account.',
        400
      )
    );
  })
);

// load shop
router.get(
  '/getSeller',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out from shop
router.get(
  '/logout',
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: true, // MUST match login (HTTPS)
        sameSite: 'None', // MUST match login
        path: '/',
      });

      res.status(200).json({
        success: true,
        message: 'Log out successful!',
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shop info
router.get(
  '/get-shop-info/:id',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop profile picture
router.put(
  '/update-shop-avatar',
  isSeller,
  /* upload.single('image'), */
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await Shop.findById(req.seller._id);

      /* const existAvatarPath = `uploads/${existsUser.avatar}`;

      fs.unlinkSync(existAvatarPath);

      const fileUrl = path.join(req.file.filename);
 */

      /* let fileUrl = '';
      if (req.body?.image) {
        fileUrl = await Cloudinary.upload(req.body?.image, 'avatar');
      } */
      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        avatar: req.body?.image,
      });

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  '/update-seller-info',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler('User not found', 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
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

// update storefront content --- business owner
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

// update store payment settings --- business owner
router.put(
  '/update-payment-settings',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
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
      if (partialAdvanceEnabled && (!Number.isFinite(pct) || pct < 1 || pct > 100)) {
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
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all sellers --- for admin
router.get(
  '/admin-all-sellers',
  isAuthenticated,
  isAdmin('business_owner'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller ---admin
router.delete(
  '/delete-seller/:id',
  isAuthenticated,
  isAdmin('business_owner'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler('Seller is not available with this id', 400)
        );
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: 'Seller deleted successfully!',
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  '/update-payment-methods',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller withdraw merthods --- only seller
router.delete(
  '/delete-withdraw-method/',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler('Seller not found with this id', 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
