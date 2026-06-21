import { env } from "@wohaai/env-ts";
import { getConsumer } from "@wohaai/kafka";
import { authMailerLogger } from "@wohaai/telemetry";
import { dispatchVerificationEmailService } from "@/services/dispatch-verification-email";
import kafka from "../../../../../packages/config/kafka.json"
import { VerifySignupEmailEvent } from "@wohaai/types";

// CONSUMER
const consumer = getConsumer({
  kafkaClientID: "auth-mailer-service",
  brokers: [env.AUTH_KAFKA_BROKER],
  consumerGroupID:
    kafka.consumerGroups.emailVerification
});

export async function consumeVerificationEmail() {
  authMailerLogger.debug("✅ Connecting to Kafka for verification email consumer");
  await consumer.connect();

  authMailerLogger.debug("✅ Subscribing to verification email topic");
  await consumer.subscribe({
    topic: kafka.topics.emailVerification,
    fromBeginning: false,
  });

  authMailerLogger.info(
    "✅ Verification email consumer started",
  );

  await consumer.run({
    eachMessage: async ({
      topic,
      partition,
      message,
    }) => {
      try {
        const rawMessage =
          message.value?.toString();

        // EMPTY MESSAGE
        if (!rawMessage) {
          throw new Error(
            "Kafka message value is empty",
          );
        }

        // PARSE MESSAGE
        let parsedMessage: VerifySignupEmailEvent;

        try {
          parsedMessage =
            JSON.parse(rawMessage);
        } catch {
          authMailerLogger.debug("❌ Failed to parse verification email message JSON");
          throw new Error(
            "Invalid kafka message JSON payload",
          );
        }

        authMailerLogger.debug("✅ Parsed verification email message JSON");

        const {
          email,
          verificationCode,
        } = parsedMessage;

        // BASIC PAYLOAD VALIDATION
        if (
          !email ||
          !verificationCode
        ) {
          authMailerLogger.debug("❌ Missing required verification email payload fields");
          throw new Error(
            "Missing required verification email payload fields",
          );
        }

        authMailerLogger.debug({ email }, "✅ Validated verification email payload fields");

        authMailerLogger.debug({ email }, "Dispatching verification email");

        // DISPATCH EMAIL
        await dispatchVerificationEmailService({
          email,
          verificationCode,
        });

        authMailerLogger.debug({ email }, "✅ Verification email dispatched");

        authMailerLogger.info(
          {
            topic,
            partition,
            offset: message.offset,
            email,
          },
          "✅ Verification email processed successfully",
        );
      } catch (error) {
        authMailerLogger.error(
          {
            error,
            topic,
            partition,
            offset: message.offset,
            rawMessage:
              message.value?.toString(),
          },
          "❌ Verification email consumer failed",
        );

        /**
         * IMPORTANT:
         * Rethrowing prevents KafkaJS from
         * committing the offset automatically.
         *
         * This allows retry behavior.
         */
        throw error;
      }
    },
  });
}