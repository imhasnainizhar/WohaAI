import { randomInt } from "crypto";
import { AuthRepo } from "@/repo/auth-repo";
import { logger } from "@packages/observability";
import { redisHelpers } from "@packages/redis";
import { getProducer } from "@/producer";
import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { SessionExpiredError } from "@packages/errors";
import { VerifySignupEmailEvent } from "@packages/contracts/auth";
import { getSignupSession, setSignupSession, setVerificationCodeCache } from "@/redis/redis";


/**
 * Topic used for outbound email events.
 * The mailer service will subscribe to this and
 * send the actual verification email.
 */
const EMAIL_TOPIC =
  env.AUTH_MAILER_KAFKA_SIGNUP_EVENTS_TOPIC;


export interface SendVerificationParams {
  signupSessionID: string
}

export interface SendVerificationResponse {
  success: boolean
}

/**
* @service SendVerificationEmailService
*
* Responsibilities:
*  - Validate signup session exists
*  - Extract user email from Redis
*  - Generate 6-digit verification code
*  - Cache code with TTL and strong key namespace
*  - Publish Kafka event so mailer service sends email
*  - Return response to controller that wraps it for http response.
*/
export class SendVerificationEmailService {
  constructor(private readonly authRepo: AuthRepo) { }

  /**
   * Send verification email (signup OTP flow)
   */
  async execute({
    signupSessionID
  }: SendVerificationParams): Promise<SendVerificationResponse> {
    let pendingEmail: string | undefined;

    // fetch signup session
    const cacheKey = `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY
      }:${signupSessionID}`;

    const session =
      await getSignupSession(cacheKey);

    if (!session) throw new SessionExpiredError();

    // generate OTP
    const code = randomInt(
      100000,
      999999
    ).toString();

    logger.debug(
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

    logger.info(`[VERIFICATION] Event sent for ${pendingEmail}`);

    return { success: true }
  }
}