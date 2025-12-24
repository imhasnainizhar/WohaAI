import { logger } from "@utils/logger";
import { setCache, getCache } from "@utils/redis_client";
import { ServiceResponse, ServiceException } from "@utils/response";
import { EXPIRATION } from "@config/env";

/**
 * @service generateVerificationCode
 * - Generates a 6-digit verification code
 * - Stores it in Redis against signupSessionId
 * - Returns ServiceResponse (no exceptions for user mistakes)
 */
export const generateVerificationCodeService = async ( signupSessionId: string ) => {

  let pendingEmail; // Now, it is readable in catch-block

  try {

    if (!signupSessionId) {
      return ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Signup session ID is required.",
        errorType: "session_expired",
      });
    }

    const pendingUserStr = await getCache(`pending_signup:${signupSessionId}`)
    if (!pendingUserStr){
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 400,
          message: "session expired",
          errorType: "session_expired",
        })
      )
    }
    const pendingUser = JSON.parse(pendingUserStr);
    pendingEmail = pendingUser.email;

    // Generate a 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis with TTL
    const cacheKey = `verification_code:${signupSessionId}`;
    const cacheResult = await setCache(cacheKey, code, EXPIRATION.REDIS_SIGNUP_SESSION_TTL);

    if (!cacheResult) {
      logger.error(`[VERIFICATION] Redis failed to store code for ${pendingEmail} (SessionID: ${signupSessionId})`);
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Failed to generate verification code.",
          errorType: "internal_server_error",
        })
      );
    }

    logger.debug(`[VERIFICATION] Code generated for ${pendingEmail}, Session ${signupSessionId}: ${code}`);

    // Return the code (omit in production if sent via email)
    return ServiceResponse.success<{ code: string }>({
      success: true,
      statusCode: 200,
      message: "Verification code generated successfully.",
      data: { code },
    });

  } catch (err: any) {
    if (err instanceof ServiceException) throw err;

    logger.error(`[VERIFICATION] Unexpected error for ${pendingEmail}:`, err?.message || err);

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: "Internal server error",
        errorType: "internal_server_error",
      })
    );
  }
};
