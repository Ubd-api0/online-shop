const express = require('express');
const router = express.Router();
const Category = require('../model/category');
const { isSeller } = require('../middleware/auth');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

// public — list all categories
router.get(
  '/get-all',
  catchAsyncErrors(async (req, res) => {
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, categories });
  })
);

// owner — create
router.post(
  '/create',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const { name, subTitle, image, order } = req.body;
    if (!name || !name.trim()) {
      return next(new ErrorHandler('Category name is required', 400));
    }
    const exists = await Category.findOne({
      name: new RegExp(`^${name.trim()}$`, 'i'),
    });
    if (exists) return next(new ErrorHandler('Category already exists', 400));

    const count = await Category.countDocuments();
    const category = await Category.create({
      name: name.trim(),
      subTitle: subTitle || '',
      image: image || '',
      order: typeof order === 'number' ? order : count,
    });
    res.status(201).json({ success: true, category });
  })
);

// owner — update
router.put(
  '/update/:id',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ErrorHandler('Category not found', 404));

    const { name, subTitle, image, order } = req.body;
    if (name !== undefined) category.name = String(name).trim();
    if (subTitle !== undefined) category.subTitle = subTitle;
    if (image !== undefined) category.image = image;
    if (order !== undefined) category.order = Number(order) || 0;
    await category.save();

    res.status(200).json({ success: true, category });
  })
);

// owner — delete
router.delete(
  '/delete/:id',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new ErrorHandler('Category not found', 404));
    res.status(200).json({ success: true, message: 'Category deleted' });
  })
);

module.exports = router;
