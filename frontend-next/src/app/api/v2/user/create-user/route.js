import { NextResponse } from "next/server";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { registerUnverifiedUser } from "@/lib/data/users";
import { sendVerificationEmail } from "@/lib/email/send";

export const POST = withErrorHandling(async (request) => {
  const { name, email, password, file } = await request.json();
  const user = await registerUnverifiedUser({ name, email, password, avatar: file });

  try {
    await sendVerificationEmail(user, request.headers.get("origin"));
  } catch (err) {
    throw new ApiError(`Account created, but the activation email could not be sent: ${err.message}`, 500);
  }

  return NextResponse.json(
    { success: true, message: `We've sent an activation link to ${user.email}. Please check your inbox.` },
    { status: 201 }
  );
});
