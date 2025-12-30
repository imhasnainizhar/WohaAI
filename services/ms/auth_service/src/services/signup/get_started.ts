import { createJwtToken } from "@utils/jwt";
import { randomUUID } from "crypto";
import { ServiceResponse, ServiceException } from "@utils/response";
import { setCache } from "@utils/redis";
import { prisma } from "../../clients/prisma";
import { env, EXPIRATION } from "@config/env";
import { logger } from "@utils/logger";
import { GetStartedSchema, GetStartedType } from "shared/zod/schemas/auth/get_started";
import { GetStartedApiResponse } from "shared/domain/types/auth/services";

export const getStartedService = async (body: GetStartedType) => {
  try {
    // Validate the user idnetifier wheather a username or email, using Zod schema
    logger.debug("🧩 Validating user identifier input...");
    const parsed = GetStartedSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn({
        message: `⚠️ User identifier validation failed`,
        issues: parsed.error.issues,
      });
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 400,
          message: `Invalid ${parsed?.error?.flatten().fieldErrors?.usernameOrEmail?.[0]}.`,
          errorType: "validation_error",
          errors: parsed.error.flatten().fieldErrors,
        })
      );
    }

    // Taking type and value of user identifier
    const { type, value } = parsed.data.usernameOrEmail;
    const identifierType = type;
    const identifier = value;

    // Check if identifier is already taken
    logger.debug(`🔎 Checking ${identifierType} availability: ${identifier}`);
    let existingUser;
    if (identifierType === "username") {
      existingUser = await prisma.user.findUnique({
        where: { username: identifier },
      });
    } else {
      existingUser = await prisma.user.findUnique({
        where: { email: identifier },
      });
    }

    if (existingUser) {
      // User exists → treat as signin
      logger.info(`🔑 Existing ${identifierType} signing in: ${identifier}`);

      // Create signin session token
      const signinSessionID = randomUUID();
      const signinSessionToken = createJwtToken(
        { userID: existingUser.userID, signinSessionID: signinSessionID },
        env.JWT_SIGNIN_SESSION_SECRET_KEY,
        { expiresIn: Number(EXPIRATION.JWT_SIGNIN_SESSION_TOKEN) }
      );

      // Optionally cache session info in Redis if needed
      await setCache(
        `${env.ACTIVE_SIGNIN_SESSION_KEY}:${signinSessionID}`,
        JSON.stringify({ userID: existingUser.userID }),
        EXPIRATION.REDIS_SIGNIN_SESSION_TTL
      );

      // Prepare session cookie
      const signinCookies = [
        {
          name: env.SIGNIN_SESSION_TOKEN_NAME,
          value: signinSessionToken,
          options: {
            httpOnly: true,
            secure: env.SECURE_COOKIE_OPTION,
            sameSite: env.SAME_SITE_COOKIE_OPTION,
            path: "/",
            maxAge: EXPIRATION.SIGNIN_SESSION_COOKIE,
          },
        },
      ];

      return ServiceResponse.success({
        success: true,
        statusCode: 200,
        data: {
          identifierType,
          identifier,
          already_exists: true,
        },
        message: `${identifierType} exists, Please signin.`,
        cookies: signinCookies,
      });
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
    const tempUser = { [identifierType]: identifier };
    await setCache(
      `${env.ACTIVE_SIGNUP_SESSION_KEY}:${signupSessionID}`,
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
    logger.debug(`✅ ${identifierType} available and session initialized: ${identifier}`);
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      data: {
        identifierType,
        identifier,
        already_exists: false,
      },
      message: `${identifierType} available and session initialized: ${identifier}`,
      cookies: signupSessionCookies,
    } as GetStartedApiResponse);
  } catch (error: any) {
    if (error instanceof ServiceException) throw error;
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
