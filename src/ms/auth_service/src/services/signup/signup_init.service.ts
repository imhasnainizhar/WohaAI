import { createJwtToken } from "@utils/jwt";
import { randomUUID } from "crypto";
import { ServiceResponse, ServiceException } from "@utils/response";
import { setCache } from "@utils/redis_client";
import { usernameSchema } from "@schemas/signup_validation.schema";
import { prisma } from "@utils/prisma_client";
import { env, EXPIRATION } from "@config/env.config";
import { logger } from "@utils/logger";

export const signupInitService = async (username: string) => {
  try {
    // Validate the username using Zod schema
    logger.debug("🧩 Validating username input...");
    const parsed = usernameSchema.safeParse(username.trim());
    if (!parsed.success) {
      logger.warn({
        message: `⚠️ Username validation failed`,
        issues: parsed.error.issues,
      });
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 400,
          message: `Invalid ${username}.`,
          errorType: "validation_error",
          errors: parsed.error.flatten().fieldErrors,
        })
      );
    }

    // Check if username is already taken
    logger.debug(`🔎 Checking username availability: ${parsed.data}`);
    const existingUser = await prisma.user.findUnique({
      where: { username: parsed.data },
      select: { id: true },
    });

    if (existingUser) {
      logger.info(`🚫 Username already taken: ${parsed.data}`);
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 409,
          message: "Username already taken",
          errorType: "conflict_error",
          errors: { username: ["username already taken"] },
        })
      );
    }

    // Create signup session ID and JWT token
    logger.debug("🔐 Creating signup session token...");
    const signupSessionID = randomUUID();
    const signupSessionToken = createJwtToken(
      { signupSessionID },
      env.JWT_SIGNUP_SESSION_SECRET_KEY,
      { expiresIn: Number(EXPIRATION.JWT_SIGNUP_SESSION_TOKEN) }
    );

    // Store temporary signup data in Redis
    logger.debug("💾 Caching pending signup session in Redis...");
    const tempUser = { username: parsed.data };
    await setCache(
      `pending_signup:${signupSessionID}`,
      JSON.stringify(tempUser),
      EXPIRATION.REDIS_SIGNUP_SESSION_TTL
    );

    // Prepare signup session cookie
    const signupSessionCookies = [
      {
        name: env.SIGNUP_SESSION_TOKEN_NAME,
        value: signupSessionToken,
        options: {
          httpOnly: true,
          secure: env.SECURE_COOKIE_OPTION,
          sameSite: env.SAME_SITE_COOKIE_OPTION,
          path: "/",
          maxAge: EXPIRATION.SIGNUP_SESSION_COOKIE,
        },
      },
    ];

    // Return successful response
    logger.debug(`✅ Username available and session initialized: ${parsed.data}`);
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Username is available.",
      cookies: signupSessionCookies,
    });
  } catch (error: any) {
    // Log fatal server error
    logger.fatal({
      message: "💥 signupInitService failed",
      error: error.message,
      stack: error.stack,
    });

    // Return standardized server error response
    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: "Something went wrong on our side",
        errorType: "internal_server_error",
      })
    );
  }
};
