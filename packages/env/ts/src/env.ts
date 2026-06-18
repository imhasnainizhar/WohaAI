import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({

    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV!,
        DOCKER_TARGET: process.env.DOCKER_TARGET!,
        RUNNING_IN_DOCKER: process.env.RUNNING_IN_DOCKER!,
        LOG_LEVEL: process.env.LOG_LEVEL!,

        // JWT + Security
        JWT_AUTH_SECRET_KEY: process.env.JWT_AUTH_SECRET_KEY!,
        JWT_CHANGE_PASSWORD_SECRET_KEY:
            process.env.JWT_CHANGE_PASSWORD_SECRET_KEY!,
            
        ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET!,

        // Mailer
        MAILER_HOST: process.env.MAILER_HOST!,
        MAILER_PORT: process.env.MAILER_PORT!,
        MAILER_USER_EMAIL: process.env.MAILER_USER_EMAIL!,
        MAILER_USER_PASSWORD: process.env.MAILER_USER_PASSWORD!,
        MAILER_EMAIL_FROM: process.env.MAILER_EMAIL_FROM!,
        MAILER_SECURE: process.env.MAILER_SECURE!,

        // AI / External APIs
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,

        // Ports
        NEXTJS_APP_PORT: process.env.NEXTJS_APP_PORT!,
        AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT!,
        USER_SERVICE_PORT: process.env.USER_SERVICE_PORT!,
        AUTH_MAILER_SERVICE_PORT: process.env.AUTH_MAILER_SERVICE_PORT!,
        AI_AGENT_PORT: process.env.AI_AGENT_PORT!,

        // Network / CORS
        CLIENT_ORIGIN: process.env.CLIENT_ORIGIN!,

        // Service URIs (derived)
        // Using name NEXT_PUBLIC_* env from .env files, as they have same value.
        AUTH_API_URI: process.env.NEXT_PUBLIC_AUTH_API_URI!,
        AUTH_MAILER_API_URI: process.env.NEXT_PUBLIC_AUTH_MAILER_API_URI!,
        USER_API_URI: process.env.NEXT_PUBLIC_USER_API_URI!,

        NEXT_PUBLIC_AUTH_API_URI: process.env.NEXT_PUBLIC_AUTH_API_URI!,
        NEXT_PUBLIC_AUTH_MAILER_API_URI: process.env.NEXT_PUBLIC_AUTH_MAILER_API_URI!,
        NEXT_PUBLIC_USER_API_URI: process.env.NEXT_PUBLIC_USER_API_URI!,

        // MongoDB
        USERS_MONGO_URI: process.env.USERS_MONGO_URI!,
        THREADS_MONGO_URI: process.env.THREADS_MONGO_URI!,

        // Redis
        AUTH_SESSION_REDIS_PORT: process.env.AUTH_SESSION_REDIS_PORT!,
        AUTH_SESSION_REDIS_URI: process.env.AUTH_SESSION_REDIS_URI!,

        // Redis - Threads History
        THREADS_HISTORY_REDIS_PORT: process.env.THREADS_HISTORY_REDIS_PORT!,
        THREADS_HISTORY_REDIS_URI: process.env.THREADS_HISTORY_REDIS_URI!,

        // Kafka
        AUTH_KAFKA_BROKER_PORT: process.env.AUTH_KAFKA_BROKER_PORT!,
        AUTH_KAFKA_BROKER_URI: process.env.AUTH_KAFKA_BROKER_URI!,

        AUTH_KAFKA_BROKER: process.env.AUTH_KAFKA_BROKER!,
        AUTH_KAFKA_CLIENT_ID: process.env.AUTH_KAFKA_CLIENT_ID!,
        AUTH_KAFKA_USERNAME: process.env.AUTH_KAFKA_USERNAME!,
        AUTH_KAFKA_PASSWORD: process.env.AUTH_KAFKA_PASSWORD!,
    },

    // Server-side only (not exposed to client)
    server: {
        NODE_ENV: z.enum(["development", "production", "test"]),

        DOCKER_TARGET: z.string().optional(),
        RUNNING_IN_DOCKER: z.string().optional(),
        LOG_LEVEL: z.string().default("info"),

        JWT_AUTH_SECRET_KEY: z.string().min(20),
        JWT_CHANGE_PASSWORD_SECRET_KEY: z.string().min(20),

        ENCRYPTION_SECRET: z.string().min(20),

        MAILER_HOST: z.string(),
        MAILER_PORT: z.coerce.number(),
        MAILER_USER_EMAIL: z.string().email(),
        MAILER_USER_PASSWORD: z.string(),
        MAILER_EMAIL_FROM: z.string(),
        MAILER_SECURE: z.coerce.boolean(),

        ANTHROPIC_API_KEY: z.string().optional(),

        NEXTJS_APP_PORT: z.coerce.number(),
        AUTH_SERVICE_PORT: z.coerce.number(),
        USER_SERVICE_PORT: z.coerce.number(),
        AUTH_MAILER_SERVICE_PORT: z.coerce.number(),
        AI_AGENT_PORT: z.coerce.number(),

        CLIENT_ORIGIN: z.string(),

        AUTH_API_URI: z.string().url(),
        AUTH_MAILER_API_URI: z.string().url(),
        USER_API_URI: z.string().url(),

        USERS_MONGO_URI: z.string(),
        THREADS_MONGO_URI: z.string(),

        AUTH_SESSION_REDIS_PORT: z.string(),
        AUTH_SESSION_REDIS_URI: z.string(),

        THREADS_HISTORY_REDIS_PORT: z.string(),
        THREADS_HISTORY_REDIS_URI: z.string(),

        AUTH_KAFKA_BROKER_PORT: z.string(),
        AUTH_KAFKA_BROKER_URI: z.string(),
        AUTH_KAFKA_BROKER: z.string(),
        AUTH_KAFKA_CLIENT_ID: z.string(),
        AUTH_KAFKA_USERNAME: z.string().optional(),
        AUTH_KAFKA_PASSWORD: z.string().optional(),
    },

    client: {
        NEXT_PUBLIC_AUTH_API_URI: z.string(),
        NEXT_PUBLIC_AUTH_MAILER_API_URI: z.string(),
        NEXT_PUBLIC_USER_API_URI: z.string(),
    },

    // TODO: Fix env load on local env
});
