import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { ApiError } from "@/lib/api/errors";

export async function findUserByEmail(email, { withPassword = false } = {}) {
  await connectDB();
  const query = User.findOne({ email });
  return withPassword ? query.select("+password") : query;
}

export async function findUserById(id, { withPassword = false } = {}) {
  await connectDB();
  const query = User.findById(id);
  return withPassword ? query.select("+password") : query;
}

export async function createUser({ name, email, password, avatar }) {
  await connectDB();
  return User.create({ name, email, password, avatar });
}

export async function verifyUserCredentials(email, password) {
  const user = await findUserByEmail(email, { withPassword: true });
  if (!user) throw new ApiError("user doesn't exists", 400);

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError("Please provide the correct informations", 400);
  }
  return user;
}

export async function updateUserInfo(userId, { email, password, phoneNumber, name }) {
  await connectDB();
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError("User not found", 400);

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError("Please provide the correct information", 400);
  }

  user.name = name;
  user.email = email;
  user.phoneNumber = phoneNumber;
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

  const isPasswordMatched = await user.comparePassword(oldPassword);
  if (!isPasswordMatched) throw new ApiError("Old password is incorrect!", 400);

  if (newPassword !== confirmPassword) {
    throw new ApiError("Password doesn't matched with each other!", 400);
  }

  user.password = newPassword;
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
