import { logger } from "@utils/logger";
import { setCache } from "@utils/redis_client";
import { ServiceException } from "@errors/service_exception";
import { ServiceResponse } from "@utils/service_response";

const VERIFICATION_CODE_TTL = 5 * 60; // 5 minutes in seconds

/**
 * @service generateVerificationCode
 * - Generates a unique verification code
 * - Stores it in Redis against the user's email
 * - Returns ServiceResponse with the code (optional to return in API)
 */
export const generateVerificationCodeService = async (email: string) => {
  try {
    if (!email) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 400,
          message: "Email is required to generate verification code",
          errorType: "invalid_input",
        })
      );
    }

    // Generate a 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis with TTL
    const cacheKey = `verification_code:${email}`;
    const cacheResult = await setCache(cacheKey, code, VERIFICATION_CODE_TTL);

    if (!cacheResult) {
      logger.error(`[VERIFICATION] Failed to store code for ${email}`);
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Failed to generate verification code",
          errorType: "internal_server_error",
        })
      );
    }

    logger.info(`[VERIFICATION] Code generated for ${email}: ${code}`);

    // Return the code (optional, remove in production if sending via email only)
    return ServiceResponse.success<{ code: string }>({
      success: true,
      statusCode: 200,
      message: "Verification code generated successfully",
      data: { code },
    });
  } catch (err: any) {
    if (err instanceof ServiceException) throw err;

    logger.error(`[VERIFICATION] Error generating code for ${email}:`, err?.message || err);

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
