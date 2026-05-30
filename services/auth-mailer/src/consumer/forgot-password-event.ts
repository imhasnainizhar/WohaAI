
import { env } from "@/config/env";
import { getConsumer } from "@packages/kafka";
import { authMailerLogger } from "@packages/observability";
import { dispatchForgotPasswordEmailService } from "@/services/dispatch-forgot-password-email";

// TYPES
interface ForgotPasswordEmailMessage {
  email: string;
  resetPasswordCode: string;
}

// CONSUMER
const consumer = getConsumer({
  kafkaClientID: "auth-mailer-service",
  brokers: env.AUTH_KAFKA_BROKERS,
  consumerGroupID:
    env.AUTH_KAFKA_PASSWORD_EVENTS_CONSUMER_GROUP_ID,
});

export async function consumeForgotPasswordEmail() {
  await consumer.connect();

  await consumer.subscribe({
    topic:
      env.AUTH_KAFKA_FORGOT_PASSWORD_EVENTS_TOPIC,

    fromBeginning: false,
  });

  authMailerLogger.info(
    "Forgot password email consumer started",
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
            "Kafka forgot password message value is empty",
          );
        }

        // PARSE MESSAGE
        let parsedMessage: ForgotPasswordEmailMessage;

        try {
          parsedMessage =
            JSON.parse(rawMessage);
        } catch {
          throw new Error(
            "Invalid forgot password kafka JSON payload",
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
            "Missing required forgot password payload fields",
          );
        }

        // DISPATCH EMAIL
        await dispatchForgotPasswordEmailService(
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
          "Forgot password email processed successfully",
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
          "Forgot password email consumer failed",
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