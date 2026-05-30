export const EXPIRATION = {
    JWT_ACCESS_TOKEN: "45m",
    ACCESS_TOKEN_COOKIE: 45 * 60 * 1000, // 45 minutes in ms

    JWT_PRIVATE_ACCESS_SESSION_TOKEN: "10m",
    PRIVATE_ACCESS_TOKEN_COOKIE: 10 * 60 * 1000, // 10 minutes in ms

    JWT_REFRESH_TOKEN: "30d",
    JWT_REFRESH_REMEMBER_OFF_TOKEN: "2h",
    REFRESH_TOKEN_COOKIE: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    // No expiry for rememberMe = false cookie, because cookie without expiry is only a session cookie already.

    JWT_SIGNUP_SESSION_TOKEN: "10m", // 10 minutes in seconds (for email/username validation flow)
    SIGNUP_SESSION_COOKIE: 10 * 60 * 1000, // 10 minutes for cookie, in ms
    REDIS_SIGNUP_SESSION_TTL: 10 * 60, // Match signup session (10 min),

    JWT_SIGNUP_SESSION_TOKEN_EXTENDED: "20m", // 20 minutes in seconds (for post email-verification signup flow)
    SIGNUP_SESSION_COOKIE_EXTENDED: 20 * 60 * 1000, // 20 minutes for cookie, in ms
    REDIS_SIGNUP_SESSION_TTL_EXTENDED: 20 * 60, // Match signup session (20 min)

    JWT_FORGOT_PASSWORD_SESSION_SECRET_KEY: "10m",
    FORGOT_PASSWORD_SESSION_COOKIE: 10 * 60 * 1000,
    REDIS_FORGOT_PASSWORD_SESSION_TTL: 10 * 60, // Match signup session (20 min)
};