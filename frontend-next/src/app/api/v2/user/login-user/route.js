import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { verifyUserCredentials } from "@/lib/data/users";
import { issueAuthResponse } from "@/lib/auth/cookies";

export const POST = withErrorHandling(async (request) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    throw new ApiError("Please provide the all filelds", 400);
  }

  const user = await verifyUserCredentials(email, password);
  return issueAuthResponse(user, 201);
});
