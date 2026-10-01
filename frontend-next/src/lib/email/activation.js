import jwt from "jsonwebtoken";
import sendMail from "@/lib/email/sendMail";
import appConfig from "@/config/appConfig";

// The link carries only the user id (never the password) and lasts 24h.
export function createActivationToken(user) {
  return jwt.sign({ id: String(user._id) }, process.env.ACTIVATION_SECRET, { expiresIn: "24h" });
}

export async function sendActivationEmail(user, origin) {
  const url = `${origin || process.env.FRONTEND_URL}/activation/${createActivationToken(user)}`;
  const brand = appConfig.name || "our store";
  await sendMail({
    email: user.email,
    subject: `Verify your email for ${brand}`,
    message: `Hello ${user.name},\n\nPlease verify your email to activate your ${brand} account:\n${url}\n\nThis link expires in 24 hours. If you didn't sign up, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#111">
      <h2 style="margin:0 0 12px">Welcome to ${brand}, ${user.name}!</h2>
      <p style="margin:0 0 20px;line-height:1.5">Please confirm your email address to activate your account.</p>
      <a href="${url}" style="display:inline-block;background:#f43f5e;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold">Verify my email</a>
      <p style="margin:20px 0 0;font-size:12px;color:#666;line-height:1.5">This link expires in 24 hours. If the button doesn't work, open:<br>${url}</p>
    </div>`,
  });
}
