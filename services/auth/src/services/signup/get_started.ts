import { createJwtToken } from "@helpers/jwt";
import { randomUUID } from "crypto";
import { ServiceResponse, ServiceException } from "@packages/shared/utils";
import { setCache } from "@helpers/redis";
import { prisma } from "@clients/prisma";
import { env, EXPIRATION } from "@config/env";
import { logger } from "@packages/shared/utils";
import { GetStartedResponseData } from "@packages/shared/auth";
import { GetStartedDTO } from "@packages/shared/auth";

/**
 * @description This is service to get started with signup, taking email or username.
 * @param dto : GetStartedDTO
 * @returns ServiceResponse<GetStartedResponseData>
 */
export const getStartedService = async (dto: GetStartedDTO): Promise<ServiceResponse<GetStartedResponseData>> => {
  try {
    // Taking type and value of user identifier
    const { type, value } = dto.usernameOrEmail;
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
        `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signinSessionID}`,
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
    console.log(signupSessionID)
    console.log(existingUser)
    const signupSessionToken = createJwtToken(
      { signupSessionID },
      env.JWT_SIGNUP_SESSION_SECRET_KEY,
      { expiresIn: Number(EXPIRATION.SIGNUP_SESSION_COOKIE) }
    );

    // Store temporary signup data in Redis
    logger.debug("💾 Caching pending signup session in Redis...");
    const tempUser = { [identifierType]: identifier };
    await setCache(
      `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSessionID}`,
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
    });
  } catch (error: any) {
    if (error instanceof ServiceException) throw error;
    // Log fatal server error
    logger.fatal({
      message: "An error occured at getStartedService",
      error: JSON.stringify(error.message),
      stack: JSON.stringify(error.stack),
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
