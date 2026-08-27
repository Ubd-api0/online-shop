const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Shop = require('../model/shop');
const dotenv = require('dotenv');
// config
dotenv.config();

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler('Please login to continue', 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id);
  next();
});

// Single-vendor: the store is resolved from the logged-in user's token.
// Only a `business_owner` user (linked to the one Shop via `user.shop`) may pass.
exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler('Please login to continue', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findById(decoded.id);

  if (!user || user.role !== 'business_owner' || !user.shop) {
    return next(new ErrorHandler('Business owner access only', 403));
  }

  req.user = user;
  req.seller = await Shop.findById(user.shop);

  if (!req.seller) {
    return next(new ErrorHandler('Store not found', 404));
  }

  next();
});

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} can not access this resources!`)
      );
    }
    next();
  };
};

// Why this auth?
// This auth is for the user to login and get the token
// This token will be used to access the protected routes like create, update, delete, etc. (autharization)
