import { EXPIRATION } from "@config/env";
import { createJwtToken } from "../../../internals/utils/jwt";
import { logger } from "../../../internals/utils/logger";
import { getCache, deleteCache, setCache } from "../../../internals/utils/redis";
import { ServiceResponse, ServiceException } from "../../../internals/utils/response";
import { env } from "@config/env";
import { VerifyUserEmailDTO } from "@packages/shared/auth";

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
 * 7. Now user can validate further data through other services & 
 *    request user creation api to get created finally.
 * @param {verificationCode, signupSessionID, email} : VerifyUserEmailDTO
 * @returns ServiceResponse<any>
 */

export const verifyUserEmailService = async (
{  verificationCode,
  signupSessionID,
}: VerifyUserEmailDTO): Promise<ServiceResponse<any>> => {
  try {
    // Guard clause for missing inputs
    if (!signupSessionID || !verificationCode) {
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

    const code = Number(verificationCode)

    // Validate code format (6-digit)
    if (!Number.isInteger(code) || code < 100000 || code > 999999) {
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

    const pendingUserStr = await getCache(`pending_signup:${signupSessionID}`)
    const pendingEmail = JSON.parse(pendingUserStr!).email

    if (!pendingEmail) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 404,
          message: "Pending user not found",
          errorType: "not_found",
          errors: { session_id: ["Pending user not found"] },
        })
      );
    }

    // Retrieve stored code from Redis using sessionId
    /**
     * @todo
     * Create a kafka queue for setting verification codes and ailing them to users.
     */
    const redisCodeCache = await getCache(`verification_code:${signupSessionID}`);

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
    await deleteCache(`verification_code:${signupSessionID}`);

    // Generate a short-lived validation token for next signup step
    const validationToken = createJwtToken(
      { signupSessionID },
      env.JWT_SIGNUP_SESSION_SECRET_KEY,
      { expiresIn: Number(EXPIRATION.JWT_SIGNUP_SESSION_TOKEN_EXTENDED) }
    );

    const confirmedEmail = pendingEmail; // Email going to be in redis status updated

    const confirmEmailCacheKey = `email_confirmed:${signupSessionID}`
    await setCache(confirmEmailCacheKey, confirmedEmail, EXPIRATION.REDIS_SIGNUP_SESSION_TTL_EXTENDED)

    // Creating Signup Session Cookie
    const cookies = [
      {
        name: env.SIGNUP_SESSION_TOKEN_NAME,
        value: validationToken,
        options: {
          httpOnly: true,
          secure: env.SECURE_COOKIE_OPTION,
          sameSite: env.SAME_SITE_COOKIE_OPTION,
          path: "/",
          maxAge: EXPIRATION.SIGNUP_SESSION_COOKIE_EXTENDED,
        }
      }
    ]

    logger.info(`✅ ${pendingEmail} successfully verified for session: ${signupSessionID}`);

    // Return standardized success response
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Verification successful",
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
