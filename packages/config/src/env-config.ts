// Interface for your env config

export interface EnvConfig {
    // Env
    NODE_ENV: string;

    // Client configs
    CLIENT_ORIGIN: string;

    // Log configs
    LOG_LEVEL: string

    // ReCaptcha configs
    APP_PUBLIC_RECAPTCHA_SITE_KEY: string;
    RECAPTCHA_SECRET_KEY: string;

    // Ports Env variables
    USER_SERVICE_PORT: string;
    AUTH_SERVICE_PORT: string;
    MCP_GATEWAY_PORT: string;
    WEB_SEARCH_MCP_PORT: string;
    AI_AGENT_PORT: string;

    // Cookie Security options
    SECURE_COOKIE_OPTION: boolean;
    SAME_SITE_COOKIE_OPTION: "lax" | "strict" | "none";

    // JWT key
    JWT_ACCESS_SECRET_KEY: string;
    JWT_REFRESH_SECRET_KEY: string;
    JWT_PRIVATE_ACCESS_SECRET_KEY: string;
    JWT_SIGNUP_SESSION_SECRET_KEY: string;
    JWT_FORGOT_PASSWORD_SESSION_SECRET_KEY: string;

    // Token names
    REFRESH_TOKEN_NAME: string;
    ACCESS_TOKEN_NAME: string;
    PRIVATE_ACCESS_TOKEN_NAME: string;
    SIGNUP_SESSION_TOKEN_NAME: string;
    FORGOT_PASSWORD_SESSION_TOKEN_NAME: string;

    // Auth Redis Keys
    SIGNUP_SESSION_REDIS_KEY_PREFIX: string;
    FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX: string;
    VERIFICATION_CODE_REDIS_KEY_PREFIX: string;
    CONFIRMED_EMAIL_REDIS_KEY_PREFIX: string;
    CHANGE_EMAIL_SESSION_REDIS_KEY_PREFIX: string;

    // API keys
    ANTHROPIC_API_KEY: string;

    // Mailer Configs
    MAILER_HOST: string;
    MAILER_PORT: number;
    MAILER_USER_EMAIL: string;
    MAILER_USER_PASSWORD: string;
    MAILER_EMAIL_FROM: string;
    MAILER_SECURE: string;

    // Next.js NEXT_* Env Variables
    NEXT_PUBLIC_AUTH_API_URI: string;
    NEXT_PUBLIC_AUTH_MAILER_API_URI: string;
    NEXT_PUBLIC_USER_API_URI: string;

    // Mongo store for users.
    USERS_MONGO_URI: string;
    USERS_MONGO_DB_DATABASE: string;

    // Mongo store for threads.
    THREADS_MONGO_URI: string;
    THREADS_MONGO_DB_DATABASE: string;

    // Redis store for caching memories in live chat session.
    AUTH_SESSION_STORE_URI: string;
    AUTH_SESSION_REDIS_USERNAME: string;
    AUTH_SESSION_REDIS_HOST: string;
    AUTH_SESSION_STORE_PASSWORD: string;

    // Redis store for caching memories in live chat session.
    AGENT_MEMORY_REDIS_URI: string;
    AGENT_MEMORY_REDIS_USERNAME: string;
    AGENT_MEMORY_REDIS_HOST: string;
    AGENT_MEMORY_REDIS_PASSWORD: string;

    // Redis store for caching threads in live chat session.
    THREADS_HISTORY_REDIS_URI: string;
    THREADS_HISTORY_REDIS_USERNAME: string;
    THREADS_HISTORY_REDIS_HOST: string;
    THREADS_HISTORY_REDIS_PASSWORD: string;

    // Qdrant store for memories for old chat sessions.
    AGENT_MEMORY_QDRANT_URI: string;
    AGENT_MEMORY_QDRANT_API_KEY: string;

    // Kafka Broker connection configs
    AUTH_KAFKA_BROKER_HOST: string;
    AUTH_KAFKA_BROKER_PORT: number;
    AUTH_KAFKA_BROKER_URI: string;
    AUTH_KAFKA_BROKERS: string[];

    // Kafka listeners configs
    KAFKA_CFG_LISTENERS: string;
    KAFKA_CFG_ADVERTISED_LISTENERS: string;

    // Fafka Client identity
    AUTH_KAFKA_CLIENT_ID: string;

    // Kafka Security
    AUTH_KAFKA_USERNAME: string;
    AUTH_KAFKA_PASSWORD: string;

    // Kafka Topic naming
    AUTH_KAFKA_TOPIC_PREFIX: string;
    AUTH_KAFKA_FORGOT_PASSWORD_EVENTS_TOPIC: string;
    AUTH_KAFKA_EMAIL_VERIFICATION_EVENTS_TOPIC: string;
    AUTH_KAFKA_CHANGE_EMAIL_EVENTS_TOPIC: string;
    
    AUTH_KAFKA_PASSWORD_EVENTS_CONSUMER_GROUP_ID: string;
    AUTH_KAFKA_EMAIL_VERIFICATION_EVENTS_CONSUMER_GROUP_ID: string;
}