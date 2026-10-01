import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { verifyUserCredentials } from "@/lib/data/users";
import { issueAuthResponse } from "@/lib/auth/cookies";
import { sendVerificationEmail } from "@/lib/email/send";

export const POST = withErrorHandling(async (request) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    throw new ApiError("Please enter your email and password", 400);
  }

  let user;
  try {
    user = await verifyUserCredentials(email, password);
  } catch (err) {
    // Correct password but email not verified yet: send a fresh link.
    if (err.unverifiedUser) {
      await sendVerificationEmail(err.unverifiedUser, request.headers.get("origin")).catch(() => {});
    }
    throw err;
  }
  return issueAuthResponse(user, 201);
});
