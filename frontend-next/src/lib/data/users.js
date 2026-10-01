import { normalizePhone, isValidMobile } from "@/lib/phone";
import crypto from "node:crypto";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { ApiError } from "@/lib/api/errors";

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const MIN_PASSWORD = 6;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertPassword(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    throw new ApiError(`Password must be at least ${MIN_PASSWORD} characters`, 400);
  }
}

// Case-insensitive: older accounts may have been stored with capitals.
export async function findUserByEmail(email, { withPassword = false } = {}) {
  await connectDB();
  const query = User.findOne({ email: new RegExp(`^${escapeRegex(String(email || "").trim())}$`, "i") });
  return withPassword ? query.select("+password") : query;
}

export async function findUserById(id, { withPassword = false } = {}) {
  await connectDB();
  const query = User.findById(id);
  return withPassword ? query.select("+password") : query;
}

// Google sign-in: find the account by Google id or email, or create it.
// Google has already verified the email, so the account is verified too.
export async function findOrCreateGoogleUser({ sub, email, name, picture }) {
  await connectDB();
  let user = await User.findOne({ googleId: sub });
  if (!user) user = await findUserByEmail(email);

  if (user) {
    let changed = false;
    if (!user.googleId) (user.googleId = sub), (changed = true);
    if (user.isVerified === false) (user.isVerified = true), (changed = true);
    if (!user.avatar && picture) (user.avatar = picture), (changed = true);
    if (changed) await user.save({ validateBeforeSave: false });
    return { user, created: false };
  }

  const created = await User.create({
    name: name || email.split("@")[0],
    email,
    // never used to sign in — Google users can set a real one later
    password: crypto.randomBytes(24).toString("base64url"),
    passwordSet: false,
    avatar: picture || "",
    googleId: sub,
    isVerified: true,
  });
  return { user: created, created: true };
}

// Signup: creates the account unverified (or refreshes a still-unverified
// one, so signing up again just re-sends the link). Verified accounts can't
// be re-registered.
export async function registerUnverifiedUser({ name, email, password, avatar }) {
  await connectDB();
  if (!name?.trim()) throw new ApiError("Please enter your name", 400);
  if (!EMAIL_RE.test(String(email || "").trim())) throw new ApiError("Please enter a valid email address", 400);
  assertPassword(password);

  const existing = await findUserByEmail(email);
  if (existing && existing.isVerified !== false) {
    throw new ApiError("An account with this email already exists — please log in", 400);
  }
  if (existing) {
    existing.name = name.trim();
    existing.password = password;
    if (avatar) existing.avatar = avatar;
    await existing.save();
    return existing;
  }
  return User.create({ name: name.trim(), email, password, avatar, isVerified: false });
}

// Idempotent: opening the link twice (or React running the effect twice in
// dev) just returns the already-verified user.
export async function verifyUserAccount(userId) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new ApiError("This activation link is no longer valid", 400);
  if (user.isVerified === false) {
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
    user.justVerified = true; // lets the route send a welcome email once
  }
  return user;
}

export async function verifyUserCredentials(email, password) {
  const user = await findUserByEmail(email, { withPassword: true });
  if (!user) throw new ApiError("No account found with this email", 400);
  if (user.passwordSet === false) {
    throw new ApiError("This account uses Google sign-in — tap “Continue with Google”", 400);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError("Please provide the correct informations", 400);
  }
  if (user.isVerified === false) {
    const err = new ApiError("Please verify your email first — we've sent you a new activation link", 403);
    err.unverifiedUser = user;
    throw err;
  }
  return user;
}

export async function updateUserInfo(userId, { email, password, phoneNumber, name }) {
  await connectDB();
  // Look the account up by the session's user id — not by the (editable) email.
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError("User not found", 400);
  if (!EMAIL_RE.test(String(email || "").trim())) throw new ApiError("Please enter a valid email address", 400);
  if (String(email).trim().toLowerCase() !== user.email) {
    const taken = await findUserByEmail(email);
    if (taken && String(taken._id) !== String(user._id)) throw new ApiError("This email is already in use", 400);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError("Please provide the correct information", 400);
  }

  if (phoneNumber && !isValidMobile(phoneNumber)) {
    throw new ApiError("Please enter a valid mobile number, e.g. 0300-1234567", 400);
  }

  user.name = name;
  user.email = email;
  user.phoneNumber = phoneNumber ? normalizePhone(phoneNumber) : "";
  await user.save();
  return user;
}

export async function updateUserAvatar(userId, imageUrl) {
  await connectDB();
  return User.findByIdAndUpdate(userId, { avatar: imageUrl }, { new: true });
}

export async function upsertUserAddress(userId, address) {
  await connectDB();
  const user = await User.findById(userId);

  const sameTypeAddress = user.addresses.find(
    (a) => a.addressType === address.addressType
  );
  if (sameTypeAddress && String(sameTypeAddress._id) !== String(address._id)) {
    throw new ApiError(`${address.addressType} address already exists`, 400);
  }

  const existsAddress = user.addresses.find(
    (a) => String(a._id) === String(address._id)
  );
  if (existsAddress) {
    Object.assign(existsAddress, address);
  } else {
    user.addresses.push(address);
  }

  await user.save();
  return user;
}

export async function deleteUserAddress(userId, addressId) {
  await connectDB();
  await User.updateOne({ _id: userId }, { $pull: { addresses: { _id: addressId } } });
  return User.findById(userId);
}

export async function updateUserPassword(userId, { oldPassword, newPassword, confirmPassword }) {
  await connectDB();
  const user = await User.findById(userId).select("+password");

  // Google-created accounts have no password the user knows yet: let them
  // set one without the old password.
  if (user.passwordSet !== false) {
    const isPasswordMatched = await user.comparePassword(oldPassword || "");
    if (!isPasswordMatched) throw new ApiError("Current password is incorrect", 400);
  }

  assertPassword(newPassword);
  if (newPassword !== confirmPassword) {
    throw new ApiError("New passwords don't match", 400);
  }

  user.password = newPassword;
  user.passwordSet = true;
  await user.save();
}

export async function listAllUsers() {
  await connectDB();
  return User.find().sort({ createdAt: -1 });
}

export async function deleteUserById(id) {
  await connectDB();
  const user = await User.findById(id);
  if (!user) throw new ApiError("User is not available with this id", 400);
  await User.findByIdAndDelete(id);
}
