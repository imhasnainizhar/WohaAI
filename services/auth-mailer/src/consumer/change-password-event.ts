
import { env } from "@packages/env-ts";
import { getConsumer } from "@packages/kafka";
import { authMailerLogger } from "@packages/observability";
import { dispatchChangePasswordEmailService } from "@/services/dispatch-change-password-email";
import kafka from "../../../../packages/config/kafka.json"

// TYPES
interface ForgotPasswordEmailMessage {
  email: string;
  resetPasswordCode: string;
}

// CONSUMER
const consumer = getConsumer({
  kafkaClientID: "auth-mailer-service",
  brokers: [env.AUTH_KAFKA_BROKER],
  consumerGroupID:
    kafka.consumerGroups.changePassword
});

export async function consumeChangePasswordEmail() {
  await consumer.connect();

  await consumer.subscribe({
    topic: kafka.topics.changePassword
  });

  authMailerLogger.info(
    "Change password email consumer started",
  );

  await consumer.run({
    eachMessage: async ({
      topic,
      partition,
      message,
    }) => {
      try {
        const rawMessage = message.value?.toString();

        // EMPTY MESSAGE
        if (!rawMessage) {
          throw new Error(
            "Kafka change password message value is empty",
          );
        }

        // PARSE MESSAGE
        let parsedMessage: ForgotPasswordEmailMessage;

        try {
          parsedMessage =
            JSON.parse(rawMessage);
        } catch {
          throw new Error(
            "Invalid change password kafka JSON payload",
          );
        }

        const {
          email,
          resetPasswordCode,
        } = parsedMessage;

        // BASIC PAYLOAD VALIDATION
        if (
          !email ||
          !resetPasswordCode
        ) {
          throw new Error(
            "Missing required change password payload fields",
          );
        }

        // DISPATCH EMAIL
        await dispatchChangePasswordEmailService(
          {
            email,
            resetPasswordCode,
          },
        );

        authMailerLogger.info(
          {
            topic,
            partition,
            offset: message.offset,
            email,
          },
          "Change password email processed successfully",
        );
      } catch (error) {
        authMailerLogger.error(
          {
            error,
            topic,
            partition,
            offset: message.offset,
            rawMessage: message.value?.toString()
          },
          "Change password email consumer failed"
        );

        /**
         * IMPORTANT:
         * Rethrowing prevents KafkaJS
         * from committing the offset.
         *
         * This enables retries.
         */
        throw error;
      }
    },
  });
}