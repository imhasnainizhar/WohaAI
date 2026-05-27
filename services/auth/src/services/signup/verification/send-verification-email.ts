import { randomInt } from 'crypto';
import { logger } from "@helpers/logger";
import { setCache, getCache } from "@helpers/redis";
import { ServiceResponse, ServiceException } from "@helpers/response";
import { env, EXPIRATION } from "@config/env";
import { getProducer } from "@producer/producer"
import { SendVerificationEmailDTO, VerifySignupEmailEvent } from "../../../../../../packages/api/src/auth";

/**
 * Topic used for outbound email events.
 * The mailer service will subscribe to this and
 * send the actual verification email.
 */
const EMAIL_TOPIC = env.KAFKA_SIGNUP_EMAIL_EVENTS;

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
export const sendVerificationEmailService = async (
  { signupSessionID  }: SendVerificationEmailDTO
): Promise<ServiceResponse<{ code: string }>> => {

  let pendingEmail: string | undefined;

  try {
    // ---- Input validation ----
    if (!signupSessionID || signupSessionID.length < 6) {
      return ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Invalid session ID or session expired",
        errorType: "session_expired",
      });
    }

    // ---- Fetch pending user session ----
    const pendingUserStr = await getCache(`${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSessionID}`);

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
    const code = randomInt(100000, 999999).toString();

    logger.debug(
      `[VERIFICATION] Generated code for ${pendingEmail} (Session ${signupSessionID})`
    );

    // ---- Cache code against session ----
    const cacheKey = `verification_code:${signupSessionID}`;
    const stored = await setCache(
      cacheKey,
      JSON.stringify({ email: pendingEmail, code }),
      EXPIRATION.REDIS_SIGNUP_SESSION_TTL
    );

    if (!stored) {
      logger.error(
        `[VERIFICATION] Failed to cache code for ${pendingEmail} (Session ${signupSessionID})`
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
    // const producer = await getProducer(EMAIL_TOPIC);

    const event: VerifySignupEmailEvent = {
      type: "signup_verification_code",
      email: pendingEmail!,
      code,
      signupSessionID: signupSessionID,
      createdAt: new Date(),
    };

    const stringifiedEvent = JSON.stringify(event);

    // Fix: Ensure producer is defined and available
    const producer = await getProducer(EMAIL_TOPIC);

    await producer.send({
      topic: EMAIL_TOPIC,
      messages: [
        { value: JSON.stringify({ stringifiedEvent }) },
      ],
    });
    
    logger.info(
      `[VERIFICATION] Fluvio event dispatched for ${pendingEmail} (Session ${signupSessionID})`
    );

    // Respond to API caller
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Verification code generated successfully.",
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
