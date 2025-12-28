import { logger } from "@utils/logger";
import { setCache, getCache } from "@utils/redis";
import { ServiceResponse, ServiceException } from "@utils/response";
import { EXPIRATION } from "@config/env";
import getProducer from "@domain/producer/producer"

/**
 * Topic used for outbound email events.
 * The mailer service will subscribe to this and
 * send the actual verification email.
 */
const EMAIL_TOPIC = "verification-emails";

/**
 * @service generateVerificationCodeService
 *
 * Responsibilities:
 *  - Validate signup session exists
 *  - Extract user email from Redis
 *  - Generate 6-digit verification code
 *  - Cache code with TTL and strong key namespace
 *  - Publish Fluvio event so mailer service sends email
 *  - Return ServiceResponse (user-safe)
 *
 * Notes:
 *  - We do NOT throw user-visible exceptions for normal failures
 *    like expired sessions – instead we return error responses.
 *  - We only throw ServiceException for true system failures.
 */
export const generateVerificationCodeService = async (
  signupSessionId: string
): Promise<ServiceResponse<{ code: string }>> => {

  let pendingEmail: string | undefined;

  try {
    // ---- Input validation ----
    if (!signupSessionId || signupSessionId.length < 6) {
      return ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Invalid session ID or session expired",
        errorType: "session_expired",
      });
    }

    // ---- Fetch pending user session ----
    const pendingUserStr = await getCache(`pending_signup:${signupSessionId}`);

    if (!pendingUserStr) {
      return ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Session expired",
        errorType: "session_expired",
      });
    }

    const pendingUser = JSON.parse(pendingUserStr);
    pendingEmail = pendingUser.email;

    // ---- Generate 6 digit numeric code ----
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    logger.debug(
      `[VERIFICATION] Generated code for ${pendingEmail} (Session ${signupSessionId})`
    );

    // ---- Cache code against session ----
    const cacheKey = `verification_code:${signupSessionId}`;
    const stored = await setCache(
      cacheKey,
      JSON.stringify({ email: pendingEmail, code }),
      EXPIRATION.REDIS_SIGNUP_SESSION_TTL
    );

    if (!stored) {
      logger.error(
        `[VERIFICATION] Failed to cache code for ${pendingEmail} (Session ${signupSessionId})`
      );
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Failed to generate verification code",
          errorType: "internal_server_error",
        })
      );
    }

    // ---- Push event to Fluvio (async email sending) ----
    const producer = await getProducer(EMAIL_TOPIC);

    const event = JSON.stringify({
      type: "signup_verification_code",
      email: pendingEmail,
      code,
      sessionId: signupSessionId,
      createdAt: new Date().toISOString(),
    });

    await producer.send("", event);

    logger.info(
      `[VERIFICATION] Fluvio event dispatched for ${pendingEmail} (Session ${signupSessionId})`
    );

    // ---- Respond to API caller ----
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Verification code generated successfully.",
      data: { code }, // You can remove this in production if needed
    });

  } catch (err: any) {

    if (err instanceof ServiceException) throw err;

    logger.error(
      `[VERIFICATION] Unexpected error for ${pendingEmail ?? "unknown email"}:`,
      err?.message || err
    );

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
