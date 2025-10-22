import { logger } from "@utils/logger";
import { ServiceResponse, ServiceException } from "@utils/response";
import { prisma } from "@utils/prisma_client";
import { setCache, getCache, deleteCache } from "@utils/redis_client";
import {
  displayNameSchema,
  Email,
  emailSchema,
  passwordSchema,
} from "@schemas/signup_validation.schema";
import { env, EXPIRATION } from "@config/env.config";
import { createJwtToken } from "@utils/jwt";

/**
 * Validates and records the user's display name in an active signup session.
 * 
 * Control flow logic:
 * 1. The function retrieves the current session state from Redis (this acts like a memory of all prior verified data).
 * 2. It confirms that the session belongs to the same username to prevent step-hopping or impersonation.
 * 3. The input names are validated through Zod schema.
 * 4. If names differ from previous valid values, they are updated in Redis.
 * 5. If Redis session is missing, expired, or mismatched, it blocks the request — ensuring only valid sessions can proceed.
 */
export const validateDisplayNameService = async (
  signupSessionID: string,
  firstName: string,
  lastName: string,
  username: string
) => {
  try {
    logger.debug("Validating display name...");

    // Retrieve session data from Redis for the current signup session
    const pending = await getPending(signupSessionID);

    // Security check: ensure the username matches what was stored previously
    // This prevents users from changing usernames mid-signup
    if (pending.username !== username) throwStepMismatch("username");

    // Validate input using Zod schema
    const parsed = displayNameSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    if (!parsed.success) throwValidationError(parsed.error, "displayName");

    // If existing names in Redis differ from the newly validated ones, update Redis
    if (
      (pending.firstName && pending.firstName !== parsed.data?.firstName) ||
      (pending.lastName && pending.lastName !== parsed.data?.lastName)
    ) {
      pending.firstName = parsed.data?.firstName;
      pending.lastName = parsed.data?.lastName;
    }

    // Store updated state back in Redis with the defined TTL
    await setCache(
      `pending_signup:${signupSessionID}`,
      JSON.stringify(pending),
      EXPIRATION.REDIS_SIGNUP_SESSION_TTL
    );

    logger.info("Display name validated and cached.");
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Display name is valid.",
      data: parsed.data,
    });
  } catch (error: any) {
    logger.fatal({
      message: "validateDisplayName failed",
      error: error.message,
      stack: error.stack,
    });
    throw internalError();
  }
};

/**
 * Validates a user's email and ensures it does not conflict with existing accounts.
 * 
 * Control flow logic:
 * 1. Retrieves current signup session data from Redis.
 * 2. Verifies that previously validated username and names match — prevents out-of-order step execution.
 * 3. Parses and validates email format using Zod.
 * 4. Checks Prisma for email duplication (ensures account uniqueness).
 * 5. Confirms that this step matches prior data stored in Redis to maintain consistent state.
 * 6. Updates Redis with validated email, extending session TTL.
 * 7. Any mismatch, conflict, or expired session halts the request, preventing continuation.
 */
export const validateEmailService = async (
  signupSessionID: string,
  email: string,
  username: string,
  firstName: string,
  lastName: string
) => {
  try {
    logger.debug("Validating email...");

    const pending = await getPending(signupSessionID);

    // Each step compares previous Redis values to ensure
    // that the user has not skipped or altered earlier verified steps
    if (pending.username !== username) throwStepMismatch("username");
    if (pending.firstName !== firstName || pending.lastName !== lastName)
      throwStepMismatch("displayName");

    // Validate email format
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) throwValidationError(parsed.error, "email");

    // Check for user email changes (if any)
    if (pending.email && pending.email !== parsed.data) {
      pending.email = parsed.data
    }

    // Check if the email already exists in the system
    const existingEmail = await prisma.user.findUnique({
      where: { email: parsed.data },
      select: { id: true },
    });
    if (existingEmail)
      throwConflictError(
        "email",
        "This email is already in use."
      );


    // Cache updated state back into Redis
    await setCache(
      `pending_signup:${signupSessionID}`,
      JSON.stringify({ ...pending, email: parsed.data }),
      EXPIRATION.REDIS_SIGNUP_SESSION_TTL
    );

    logger.info("Email validated and cached.");
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Email is valid.",
      data: { signupSessionID },
    });
  } catch (error: any) {
    logger.fatal({
      message: "validateEmail failed",
      error: error.message,
      stack: error.stack,
    });
    throw internalError();
  }
};

/**
 * Verify the email verification code and return a short-lived token for next signup step.
 * 
 * Control flow logic:
 * 1. Takes verification code.
 * 2. Get verification code cache from redis.
 * 3. Validates user input.
 * 4. Validate user email state not change when compared to redis state of signup data.
 * 5. Verify code for email verification.
 * 6. Return extended session token with success response.
 * 7. Now user can request user creation api to get created finally.
 * @param verificationCode - User-provided code (6-digit number)
 */

export const confirmUserEmailService = async (
  verificationCode: number,
  signupSessionId: string,
  email: Email
): Promise<ServiceResponse<any>> => {
  try {
    // Guard clause for missing inputs
    if (!signupSessionId || !verificationCode) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 400,
          message: "Missing verification credentials",
          errorType: "missing_credentials",
          errors: {
            verification_code: ["Verification code is required"],
            session_id: ["Signup session ID is required"],
          },
        })
      );
    }

    // Validate code format (6-digit)
    if (!Number.isInteger(verificationCode) || verificationCode < 100000 || verificationCode > 999999) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 400,
          message: "Invalid verification code format",
          errorType: "validation_error",
          errors: { verification_code: ["Must be a 6-digit number"] },
        })
      );
    }

    const pendingUserStr = await getCache(`pending_signup:${signupSessionId}`)
    const pendingEmail = JSON.parse(pendingUserStr!).email

    if (pendingEmail !== email) {
      return ServiceResponse.error({
        success: false,
        statusCode: 409,
        message: "bad request data, pls try again",
        errorType: "signup_state_conflict"
      })
    }
    // Retrieve stored code from Redis using sessionId
    const redisCodeCache = await getCache(`verification_code:${signupSessionId}`);

    if (!redisCodeCache) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 410,
          message: "Verification code expired",
          errorType: "code_expired",
          errors: { verification_code: ["Expired"] },
        })
      );
    }

    // Compare user input with cached code
    if (redisCodeCache !== String(verificationCode)) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Invalid verification code",
          errorType: "invalid_code",
          errors: { verification_code: ["The provided code is incorrect"] },
        })
      );
    }

    // Code is valid → delete it from Redis
    await deleteCache(`verification_code:${signupSessionId}`);

    // Generate a short-lived validation token for next signup step
    const validationToken = createJwtToken(
      { signupSessionId },
      env.JWT_SIGNUP_SESSION_SECRET_KEY,
      { expiresIn: Number(EXPIRATION.JWT_SIGNUP_SESSION_TOKEN_EXTENDED) }
    );

    const confirmedEmail = pendingEmail; // Email going to be in redis status updated

    const confirmEmailCacheKey = `email_confirmed:${signupSessionId}`
    await setCache(confirmEmailCacheKey, confirmedEmail, EXPIRATION.REDIS_SIGNUP_SESSION_TTL_EXTENDED)

    // Creating Signup Session Cookie
    const cookies = [
      {
        name: env.SIGNUP_SESSION_TOKEN_NAME,
        value: signupSessionId,
        options: {
          httpOnly: true,
          secure: env.SECURE_COOKIE_OPTION,
          sameSite: env.SAME_SITE_COOKIE_OPTION,
          path: "/",
          maxAge: EXPIRATION.SIGNUP_SESSION_COOKIE_EXTENDED,
        }
      }
    ]

    logger.info(`✅ ${pendingEmail} successfully verified for session: ${signupSessionId}`);

    // Return standardized success response
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Verification successful",
      data: { validationToken },
      cookies,
    });
  } catch (err: any) {
    logger.error("❌ verifyCode service error:", err);

    if (err instanceof ServiceException) throw err;

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: "Internal server error during code verification",
        errorType: "server_error",
      })
    );
  }
};

/**
 * Validates a user's password and confirms it aligns with prior session data.
 * 
 * Control flow logic:
 * 1. Retrieves Redis session state.
 * 2. Validates username, display name, and email match what was stored earlier.
 *    This ensures the user didn’t skip or tamper with previous signup steps.
 * 3. Validates password and confirmPassword fields using schema rules.
 * 4. Updates Redis cache with the hashed password (or plain, depending on config).
 * 5. If any prior value doesn’t align with the stored Redis session, the request is blocked immediately.
 */
export const validatePasswordService = async (
  signupSessionID: string,
  password: string,
  confirmPassword: string,
  username: string,
  firstName: string,
  lastName: string,
  email: string
) => {
  try {
    logger.debug("Validating password...");

    const pending = await getPending(signupSessionID);

    // Step integrity checks: all previously verified data must match the Redis session
    if (pending.username !== username) throwStepMismatch("username");
    if (pending.firstName !== firstName || pending.lastName !== lastName)
      throwStepMismatch("displayName");
    if (pending.email !== email) throwStepMismatch("email");

    // Schema-based validation for password complexity and match
    const parsed = passwordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) throwValidationError(parsed.error, "password");

    // Update cached session with verified password
    pending.password = parsed.data?.password;
    await setCache(
      `pending_signup:${signupSessionID}`,
      JSON.stringify(pending),
      EXPIRATION.REDIS_SIGNUP_SESSION_TTL_EXTENDED
    );

    logger.info("Password validated and cached.");
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Password is valid.",
      data: parsed.data,
    });
  } catch (error: any) {
    logger.fatal({
      message: "validatePassword failed",
      error: error.message,
      stack: error.stack,
    });
    throw internalError();
  }
};

/** 
 * Retrieves the user's current signup progress from Redis.
 * 
 * If Redis returns nothing, it means the session is invalid, expired, or tampered.
 * This ensures only verified, time-bound signup flows can proceed.
 */
const getPending = async (signupSessionID: string) => {
  logger.debug("Retrieving pending signup data from Redis...");
  const pendingStr = await getCache(`pending_signup:${signupSessionID}`);
  if (!pendingStr) throwSessionExpired();
  return JSON.parse(pendingStr!);
};

/**
 * Throws standardized validation error response for Zod schema failures.
 */
const throwValidationError = (error: any, field: string) => {
  logger.warn({ message: `${field} validation failed`, issues: error.issues });
  throw new ServiceException(
    ServiceResponse.error({
      success: false,
      statusCode: 400,
      message: `Invalid ${field}.`,
      errorType: "validation_error",
      errors: error.flatten().fieldErrors,
    })
  );
};

/**
 * Throws a conflict error (e.g., duplicate email in database).
 */
const throwConflictError = (field: string, message: string) => {
  logger.warn(`Conflict on field: ${field} → ${message}`);
  throw new ServiceException(
    ServiceResponse.error({
      success: false,
      statusCode: 409,
      message,
      errorType: "conflict_error",
      errors: { [field]: [message] },
    })
  );
};

/**
 * Throws a validation error if a step does not match prior Redis data.
 * 
 * This prevents users from reordering signup steps or injecting mismatched values.
 * Each condition acts like a guardrail, forcing the request to follow the intended order.
 */
const throwStepMismatch = (field: string) => {
  logger.warn(`${field} mismatch with previously validated value`);
  throw new ServiceException(
    ServiceResponse.error({
      success: false,
      statusCode: 409,
      message: `${field} does not match previously validated value.`,
      errorType: "signup_state_conflict",
    })
  );
};

/**
 * Throws when the Redis signup session is missing or expired.
 * 
 * This prevents reuse of expired sessions or bypassing signup verification flow.
 */
const throwSessionExpired = () => {
  logger.warn("Session timed out or invalid.");
  throw new ServiceException(
    ServiceResponse.error({
      success: false,
      statusCode: 400,
      message: "Invalid or expired signup session and tokens.",
      errorType: "validation_error",
    })
  );
};

/**
 * Standardized internal error response for unexpected failures.
 */
const internalError = () =>
  new ServiceException(
    ServiceResponse.error({
      success: false,
      statusCode: 500,
      message: "Something went wrong on our side",
      errorType: "internal_server_error",
    })
  );
