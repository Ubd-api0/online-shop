import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
    trim: true,
    lowercase: true,
  },
  // false until the emailed activation link is opened. Defaults to true so
  // accounts created before verification existed keep working.
  isVerified: { type: Boolean, default: true },
  // Google account id ("sub") when the user signed in with Google.
  googleId: { type: String, index: true, sparse: true },
  // false for accounts created via Google that never chose a password —
  // Change Password then lets them set one without the "old password".
  passwordSet: { type: Boolean, default: true },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  // "03001234567" (see lib/phone.js). Older accounts stored a Number; Mongoose
  // casts those to a string on read.
  phoneNumber: {
    type: String,
  },
  addresses: [
    {
      fullName: { type: String },
      phone: { type: String },
      country: { type: String },
      province: { type: String },
      city: { type: String },
      address1: { type: String },
      address2: { type: String },
      zipCode: { type: Number },
      addressType: { type: String },
    },
  ],
  role: {
    type: String,
    enum: ["customer", "business_owner"],
    default: "customer",
  },
  // Set only for the single business owner: links the owner account to the store.
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
  },
  // Optional — the UI shows the user's initial when there's no photo.
  avatar: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Mongoose 9: async hooks get no `next` — returning resolves the hook.
// Only hash when the password actually changed, never re-hash a hash.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
