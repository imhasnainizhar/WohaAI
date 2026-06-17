import { randomInt } from "crypto";
import { authLogger } from "@packages/observability";
import { getEmailVerificationProducer } from "@/producer/verify-email";
import { MaliciousActivityError, SessionExpiredError } from "@packages/errors";
import { VerifySignupEmailEvent } from "@packages/contracts/mailer";
import { getAuthSession, setVerificationCodeCache } from "@/redis/redis";
import kafka from "../../../../../../packages/config/kafka.json"

export interface SendVerificationServiceParams {
  authSessionID: string
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
    authSessionID
  }: SendVerificationServiceParams): Promise<void> {
    let pendingEmail: string | undefined;

    const session =
      await getAuthSession(authSessionID);

    if (!session) throw new SessionExpiredError();
    if (!session.email) throw new MaliciousActivityError("Email not found in session");
    pendingEmail = session.email;

    // generate OTP
    const code = randomInt(
      100000,
      999999
    ).toString();

    authLogger.debug(
      `[VERIFICATION] Code generated for ${pendingEmail} -> ${code}`
    );

    // cache OTP
    await setVerificationCodeCache(
      {
        id: authSessionID,
        verificationCode: code,
      },
    );

    // create event object to email
    const event: VerifySignupEmailEvent =
    {
      type: "signup_verification_code",
      email: pendingEmail!,
      code,
      authSessionID,
      createdAt: new Date(),
    };

    // create producer to produce event on kafka
    const producer = await getEmailVerificationProducer();

    // produce email event on kafka
    await producer.send({
      topic: kafka.topics.emailVerification,
      messages: [
        {
          value: JSON.stringify(event),
        },
      ],
    });

    authLogger.debug(`[VERIFICATION] Event sent`);
  }
}