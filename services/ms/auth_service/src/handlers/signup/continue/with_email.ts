import { asyncHandler } from "@middlewares/async_handler";
import { throwValidationError } from "@errors/auth";
import continueWithEmailService from "@services/signup/continue/with_email";
import { SignupSessionPayload } from "@shared/domain/types/auth/signup/types";
import { EmailSignupSchema } from "@shared/zod/schemas/auth/signup/continue/with_email";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { sendResponse } from "@utils/response";

export const continueWithEmailHandler = asyncHandler(async (req, res) => {
    const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME].value;
    const payload = jwt.verify(token, env.JWT_SIGNUP_SESSION_SECRET_KEY) as SignupSessionPayload;
    const signupSessionID = payload.signupSessionID;

    const parsed = EmailSignupSchema.safeParse(req.body);
    if (!parsed.success) return throwValidationError(parsed.error, "email");

    const result = await continueWithEmailService({ signupSessionID, email: parsed.data.email });

    return sendResponse({
        res,
        ...result,
        path: req.originalUrl,
    });
});