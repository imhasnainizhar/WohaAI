import { ServiceException } from "@errors/service_exception";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/service_response";
import { createToken } from "@utils/jwt";
import { getCache, deleteCache } from "@utils/redis_client";

/**
 * Verify the email verification code and return a short-lived token for next signup step.
 * @param verificationCode - User-provided code (6-digit number)
 * @param signupSessionId - Session ID created at the start of signup
 */
export const codeVerificationService = async (
  verificationCode: number,
  signupSessionId: string
): Promise<ServiceResponse<any>> => {
  try {
    // 1. Guard clause for missing inputs
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

    // 2. Validate code format (6-digit)
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

    // 3. Retrieve stored code from Redis using sessionId
    const redisCodeCache = await getCache(`verification_code:${signupSessionId}`);
    if (!redisCodeCache) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 410,
          message: "Verification code expired or not found",
          errorType: "code_expired",
          errors: { verification_code: ["Expired or not found"] },
        })
      );
    }

    // 4. Compare user input with cached code
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

    // 5. Code is valid → delete it from Redis
    await deleteCache(`verification_code:${signupSessionId}`);

    // 6. Generate a short-lived validation token for next signup step
    const validationToken = createToken(signupSessionId, "email_verified");

    logger.info(`✅ Email verification successful for session: ${signupSessionId}`);

    // 7. Return standardized success response
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Verification successful",
      data: { validationToken },
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
