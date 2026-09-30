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
