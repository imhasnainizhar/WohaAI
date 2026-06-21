
import { env } from "@wohaai/env-ts";
import { getConsumer } from "@wohaai/kafka";
import { authMailerLogger } from "@wohaai/telemetry";
import { dispatchChangePasswordEmailService } from "@/services/dispatch-change-password-email";
import kafka from "../../../../../packages/config/kafka.json";

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
  authMailerLogger.debug("✅ Connecting to Kafka for change password consumer");
  await consumer.connect();

  authMailerLogger.debug("✅ Subscribing to change password topic");
  await consumer.subscribe({
    topic: kafka.topics.changePassword
  });

  authMailerLogger.info(
    "✅ Change password email consumer started",
  );

  await consumer.run({
    eachMessage: async ({
      topic,
      partition,
      message,
    }) => {
      try {
        authMailerLogger.debug({ topic, partition, offset: message.offset }, "Received change password message");

        const rawMessage = message.value?.toString();

        // EMPTY MESSAGE
        if (!rawMessage) {
          authMailerLogger.debug("Empty message value received");
          throw new Error(
            "Kafka change password message value is empty",
          );
        }

        // PARSE MESSAGE
        let parsedMessage: ForgotPasswordEmailMessage;
        authMailerLogger.debug("✅ Parsed change password message JSON");

        try {
          parsedMessage =
            JSON.parse(rawMessage);
        } catch {
          authMailerLogger.debug("Failed to parse change password message JSON");
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
          authMailerLogger.debug("Missing required change password payload fields");
          throw new Error(
            "Missing required change password payload fields",
          );
        }

        authMailerLogger.debug({ email }, "✅ Validated change password payload fields");

        authMailerLogger.debug({ email }, "Dispatching change password email");

        // DISPATCH EMAIL
        await dispatchChangePasswordEmailService(
          {
            email,
            resetPasswordCode,
          },
        );

        authMailerLogger.debug({ email }, "✅ Change password email dispatched");

        authMailerLogger.info(
          {
            topic,
            partition,
            offset: message.offset,
            email,
          },
          "✅ Change password email processed successfully",
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
          "❌ Change password email consumer failed"
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