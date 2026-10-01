import jwt from "jsonwebtoken";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { verifyUserAccount } from "@/lib/data/users";
import { issueAuthResponse } from "@/lib/auth/cookies";

// Verifies the emailed link and signs the user straight in.
export const POST = withErrorHandling(async (request) => {
  const { activation_token } = await request.json();

  let payload;
  try {
    payload = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
  } catch (err) {
    throw new ApiError(
      err.name === "TokenExpiredError"
        ? "This activation link has expired — sign up again or log in to get a new one"
        : "This activation link is invalid",
      400
    );
  }
  if (!payload?.id) throw new ApiError("This activation link is invalid or outdated — please sign up again", 400);

  const user = await verifyUserAccount(payload.id);
  return issueAuthResponse(user, 200);
});
