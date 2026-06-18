import { env } from "@wohaai/env-ts";
import { getConsumer } from "@wohaai/kafka";
import { authMailerLogger } from "@wohaai/telemetry";
import { dispatchVerificationEmailService } from "@/services/dispatch-verification-email";
import kafka from "../../../../packages/config/kafka.json"

// TYPES
interface VerificationEmailMessage {
  email: string;
  verificationCode: string;
}

// CONSUMER
const consumer = getConsumer({
  kafkaClientID: "auth-mailer-service",
  brokers: [env.AUTH_KAFKA_BROKER],
  consumerGroupID:
    kafka.consumerGroups.emailVerification
});

export async function consumeVerificationEmail() {
  await consumer.connect();

  await consumer.subscribe({
    topic: kafka.topics.emailVerification,
    fromBeginning: false,
  });

  authMailerLogger.info(
    "Verification email consumer started",
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
        let parsedMessage: VerificationEmailMessage;

        try {
          parsedMessage =
            JSON.parse(rawMessage);
        } catch {
          throw new Error(
            "Invalid kafka message JSON payload",
          );
        }

        const {
          email,
          verificationCode,
        } = parsedMessage;

        // BASIC PAYLOAD VALIDATION
        if (
          !email ||
          !verificationCode
        ) {
          throw new Error(
            "Missing required verification email payload fields",
          );
        }

        // DISPATCH EMAIL
        await dispatchVerificationEmailService({
          email,
          verificationCode,
        });

        authMailerLogger.info(
          {
            topic,
            partition,
            offset: message.offset,
            email,
          },
          "Verification email processed successfully",
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
          "Verification email consumer failed",
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