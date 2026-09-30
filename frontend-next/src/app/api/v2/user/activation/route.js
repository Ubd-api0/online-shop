import jwt from "jsonwebtoken";
import { withErrorHandling, ApiError } from "@/lib/api/errors";
import { findUserByEmail, createUser } from "@/lib/data/users";
import { issueAuthResponse } from "@/lib/auth/cookies";

export const POST = withErrorHandling(async (request) => {
  const { activation_token } = await request.json();

  let newUser;
  try {
    newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
  } catch {
    throw new ApiError("Invalid token", 400);
  }
  if (!newUser) throw new ApiError("Invalid token", 400);

  const { name, email, password, avatar } = newUser;

  const existing = await findUserByEmail(email);
  if (existing) throw new ApiError("User already exists", 400);

  const user = await createUser({ name, email, password, avatar });
  return issueAuthResponse(user, 201);
});
