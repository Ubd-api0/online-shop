import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { findUserByEmail } from "@/lib/data/users";
import sendMail from "@/lib/email/sendMail";

function createActivationToken(user) {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
}

export const POST = withErrorHandling(async (request) => {
  const { name, email, password, file } = await request.json();

  const existing = await findUserByEmail(email);
  if (existing) throw new ApiError("User already exits", 400);

  const user = { name, email, password, avatar: file };
  const activationToken = createActivationToken(user);
  const origin = request.headers.get("origin") || process.env.FRONTEND_URL;
  const activationUrl = `${origin}/activation/${activationToken}`;

  try {
    await sendMail({
      email: user.email,
      subject: "Activate your account",
      message: `Hello ${user.name}, please click on the link to activate your account ${activationUrl} `,
    });
  } catch (err) {
    throw new ApiError(err.message, 500);
  }

  return NextResponse.json(
    {
      success: true,
      message: `please check your email:- ${user.email} to activate your account!`,
    },
    { status: 201 }
  );
});
