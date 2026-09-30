import connectDB from "@/lib/db/connect";
import CoupounCode from "@/lib/db/models/CoupounCode";
import { ApiError } from "@/lib/api/errors";

export async function createCoupon(data) {
  await connectDB();
  const exists = await CoupounCode.find({ name: data.name });
  if (exists.length !== 0) throw new ApiError("Coupoun code already exists!", 400);
  return CoupounCode.create(data);
}

export async function listShopCoupons(shopId) {
  await connectDB();
  return CoupounCode.find({ shopId });
}

export async function deleteCoupon(id) {
  await connectDB();
  const coupon = await CoupounCode.findByIdAndDelete(id);
  if (!coupon) throw new ApiError("Coupon code dosen't exists!", 400);
}

export async function findCouponByName(name) {
  await connectDB();
  return CoupounCode.findOne({ name });
}
