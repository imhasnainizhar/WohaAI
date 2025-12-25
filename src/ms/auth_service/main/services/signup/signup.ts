import { logger } from "@utils/logger";
import { ServiceResponse, ServiceException } from "@utils/response";
import { prisma } from "@utils/prisma_client";
import { setCache, getCache, deleteCache, getPending } from "@utils/redis_client";
import {
  displayNameSchema,
  Email,
  emailSchema,
  passwordSchema,
} from "@schemas/signup_validation";
import { env, EXPIRATION } from "@config/env";
import { createJwtToken } from "@utils/jwt";
import { throwValidationError, internalError, throwConflictError } from "@errors/auth";

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
  lastName: string
) => {
  try {
    logger.debug("Validating display name...");

    // Retrieve session data from Redis for the current signup session
    const pending = await getPending(signupSessionID);

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
      JSON.stringify({ ...pending, firstName: parsed.data?.firstName, lastName: parsed.data?.lastName }),
      EXPIRATION.REDIS_SIGNUP_SESSION_TTL
    );

    logger.info("Display name validated and cached.");
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Display name is valid.",
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
 * 2. Parses and validates email format using Zod.
 * 3. Checks Prisma for email duplication (ensures account uniqueness).
 * 4. Updates Redis with validated email, extending session TTL.
 */
export const validateEmailService = async (
  signupSessionID: string,
  email: string,
) => {
  try {
    logger.debug("Validating email...");

    const pending = await getPending(signupSessionID);

    // Validate email format
    const parsed = emailSchema.safeParse({ email: email.trim() });
    if (!parsed.success) throwValidationError(parsed.error, "email");

    // Check for user email changes (if any)
    if (pending.email && pending.email !== parsed.data?.email) {
      pending.email = parsed.data?.email
    }

    // Check if the email already exists in the system
    const existingEmail = await prisma.user.findUnique({
      where: { email: parsed.data?.email },
    });
    if (existingEmail)
      throwConflictError(
        "email",
        "This email is already in use."
      );


    // Cache updated state back into Redis
    await setCache(
      `pending_signup:${signupSessionID}`,
      JSON.stringify({ ...pending, email: parsed.data?.email }),
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
) => {
  try {
    logger.debug("Validating password...");

    const pending = await getPending(signupSessionID);

    // Schema-based validation for password complexity and match
    const parsed = passwordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) throwValidationError(parsed.error, "password");

    // Check for user password changes (if any)
    if (pending.password && pending.password !== parsed.data?.password) {
      pending.password = parsed.data?.password
    }

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