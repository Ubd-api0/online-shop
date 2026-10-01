import jwt from "jsonwebtoken";
import { getAuthToken } from "./cookies";
import { ApiError } from "@/lib/api/errors";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import Shop from "@/lib/db/models/Shop";

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) return null;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch {
    return null;
  }

  await connectDB();
  return User.findById(decoded.id);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError("Please login to continue", 401);
  return user;
}

export async function requireSeller() {
  const user = await requireAuth();
  if (user.role !== "business_owner" || !user.shop) {
    throw new ApiError("Business owner access only", 403);
  }
  await connectDB();
  const shop = await Shop.findById(user.shop);
  if (!shop) throw new ApiError("Store not found", 404);
  return { user, shop };
}

// Chat/member ids the signed-in user may act as: themselves, and — for the
// business owner — the store (sellers chat as the shop id).
export function actorIds(user) {
  return [String(user._id), user.role === "business_owner" && user.shop ? String(user.shop) : null].filter(Boolean);
}

export function assertActor(user, id) {
  if (!actorIds(user).includes(String(id))) throw new ApiError("Not allowed", 403);
}

export function requireRole(user, ...roles) {
  if (!roles.includes(user.role)) {
    throw new ApiError(`${user.role} can not access this resource`, 403);
  }
}
