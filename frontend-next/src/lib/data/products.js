import connectDB from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import Shop from "@/lib/db/models/Shop";
import Order from "@/lib/db/models/Order";
import { ApiError } from "@/lib/api/errors";

export async function createProduct(productData) {
  await connectDB();
  const shop = await Shop.findById(productData.shopId);
  if (!shop) throw new ApiError("Shop Id is invalid!", 400);

  return Product.create({ ...productData, shop });
}

export async function listProductsByShop(shopId) {
  await connectDB();
  return Product.find({ shopId });
}

export async function listAllProducts() {
  await connectDB();
  return Product.find().sort({ createdAt: -1 });
}

export async function findProductById(id) {
  await connectDB();
  return Product.findById(id);
}

export async function deleteShopProduct(id) {
  await connectDB();
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError("Product not found with this id!", 500);
}

export async function reviewProduct({ user, rating, comment, productId, orderId }) {
  await connectDB();
  const product = await Product.findById(productId);
  const review = { user, rating, comment, productId };

  const isReviewed = product.reviews.find((rev) => rev.user._id === user._id);
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user._id === user._id) {
        rev.rating = rating;
        rev.comment = comment;
        rev.user = user;
      }
    });
  } else {
    product.reviews.push(review);
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  await Order.findByIdAndUpdate(
    orderId,
    { $set: { "cart.$[elem].isReviewed": true } },
    { arrayFilters: [{ "elem._id": productId }], new: true }
  );
}

// ---- Paginated listing (infinite scroll) ----------------------------------

export const PRODUCT_SORTS = {
  newest: { createdAt: -1, _id: -1 },
  best_selling: { sold_out: -1, _id: -1 },
  price_asc: { discountPrice: 1, _id: 1 },
  price_desc: { discountPrice: -1, _id: -1 },
};

// Only what a product card / cart / wishlist needs — keeps each page small
// (no reviews, no description, no full embedded shop document).
const CARD_FIELDS =
  "name category tags originalPrice discountPrice stock fulfillment leadTimeDays images ratings shopId shop.name sold_out paymentOverride weightKg createdAt";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * One page of products for the storefront grids.
 * Sorted with an _id tiebreak so pages never overlap or skip items.
 */
export async function queryProducts({ category, q, sort = "newest", page = 1, limit = 20 } = {}) {
  await connectDB();
  const filter = {};
  if (category) filter.category = new RegExp(`^${escapeRegex(String(category))}$`, "i");
  if (q && String(q).trim()) {
    const rx = new RegExp(escapeRegex(String(q).trim()), "i");
    filter.$or = [{ name: rx }, { tags: rx }, { category: rx }];
  }

  const size = Math.min(48, Math.max(1, Number(limit) || 20));
  const pageNo = Math.max(1, Number(page) || 1);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(CARD_FIELDS)
      .sort(PRODUCT_SORTS[sort] || PRODUCT_SORTS.newest)
      .skip((pageNo - 1) * size)
      .limit(size)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, total, page: pageNo, hasMore: pageNo * size < total };
}
