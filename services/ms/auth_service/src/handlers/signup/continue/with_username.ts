import { UsernameSignupSchema } from "@shared/zod/schemas/auth/signup/continue/with_username";
import { throwValidationError } from "@errors/auth";
import continueWithUsernameService from "@services/signup/continue/with_username";
import { asyncHandler } from "@middlewares/async_handler";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { SignupSessionPayload } from "@shared/domain/types/auth/signup/types";

export const continueWithUsernameHandler = asyncHandler(async (req, res) => {
    const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME].value;
    const payload = jwt.verify(token, env.JWT_SIGNUP_SESSION_SECRET_KEY) as SignupSessionPayload;
    const signupSessionID = payload.signupSessionID;

    const parsed = UsernameSignupSchema.safeParse(req.body);
    if (!parsed.success) return throwValidationError(parsed.error, "username");

    const result = await continueWithUsernameService({ signupSessionID, username: parsed.data.username });

    return res.status(result.statusCode).json(result);
});