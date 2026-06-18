import { asyncHandler } from "@/middlewares/async-handler";
import { env } from "@wohaai/env-ts";
import authService from "@/services/auth-service";
import { buildCookie, Cookie, sendResponse } from "@wohaai/http";
import { Request, Response } from "express";
import { authLogger } from "@wohaai/telemetry";
import tokenNames from "../../../../../../packages/config/token-names.json";
import exp from "../../../../../../packages/config/exp.json";

/**
 * Handler for user signup init.
 */
export const signupInitHandler =
    asyncHandler(async (req: Request, res: Response) => {

        const { authToken } = await authService.signupInit();

        const accessTokenCookie: Cookie = buildCookie({
            name: tokenNames.AUTH_SESSION_TOKEN,
            value: authToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.AUTH_SESSION_COOKIE
            }
        });

        authLogger.debug({ path: req.originalUrl, method: req.method }, "🚀 Signup init successful");

        // Handler only returns response
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "Auth session initialized successfully",
            path: req.originalUrl,
            cookies: [accessTokenCookie]
        });
    }
    );
