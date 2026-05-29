import { randomInt } from "crypto";
import { AuthRepo } from "@/repo/auth-repo";
import { authLogger } from "@packages/observability";
import { getProducer } from "@/producer";
import { env } from "@/config/env";
import { SessionExpiredError } from "@packages/errors";
import { VerifySignupEmailEvent } from "@packages/contracts/auth";
import { getSignupSession, setVerificationCodeCache } from "@/redis/redis";


/**
 * Topic used for outbound email events.
 * The mailer service will subscribe to this and
 * send the actual verification email.
 */
const EMAIL_TOPIC =
  env.AUTH_KAFKA_SIGNUP_EVENTS_TOPIC;

export interface SendVerificationServiceResponse {
  verificationEmailSent: boolean
}

export interface SendVerificationServiceParams {
  signupSessionID: string
}

/**
* @AuthService SendVerificationEmailService
*
* Responsibilities:
*  - Validate signup session exists
*  - Extract user email from Redis
*  - Generate 6-digit verification code
*  - Cache code with TTL and strong key namespace
*  - Publish Kafka event so mailer service sends email
*  - Return ServiceResponse to controller that wraps it for http ServiceResponse.
*/
export class SendVerificationEmailService {

  /**
   * Send verification email (signup OTP flow)
   */
  async execute({
    signupSessionID
  }: SendVerificationServiceParams): Promise<SendVerificationServiceResponse> {
    let pendingEmail: string | undefined;

    // fetch signup session
    const cacheKey = `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSessionID}`;

    const session =
      await getSignupSession(cacheKey);

    if (!session) throw new SessionExpiredError();

    // generate OTP
    const code = randomInt(
      100000,
      999999
    ).toString();

    authLogger.debug(
      `[VERIFICATION] Code generated for ${pendingEmail}`
    );

    // cache OTP
    await setVerificationCodeCache(
      {
        signupSessionID,
        verificationCode: code,
      },
    );

    // create event object to email
    const event: VerifySignupEmailEvent =
    {
      type: "signup_verification_code",
      email: pendingEmail!,
      code,
      signupSessionID,
      createdAt: new Date(),
    };

    // create producer to produce event on kafka
    const producer = await getProducer(
      EMAIL_TOPIC
    );

    // produce email event on kafka
    await producer.send({
      topic: EMAIL_TOPIC,
      messages: [
        {
          value: JSON.stringify(event),
        },
      ],
    });

    authLogger.info(`[VERIFICATION] Event sent for ${pendingEmail}`);

    return { verificationEmailSent: true }
  }
}