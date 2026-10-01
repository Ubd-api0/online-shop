import jwt from "jsonwebtoken";

// The link carries only the user id (never the password) and lasts 24h.
// The email itself is in lib/email/send.js (sendVerificationEmail).
export function createActivationToken(user) {
  return jwt.sign({ id: String(user._id) }, process.env.ACTIVATION_SECRET, { expiresIn: "24h" });
}
