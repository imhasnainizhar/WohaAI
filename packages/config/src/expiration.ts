export const EXPIRATION = {
    JWT_ACCESS_SESSION_TOKEN: "45m",
    ACCESS_SESSION_COOKIE: 45 * 60 * 1000, // 15 minutes in ms

    JWT_PRIVATE_ACCESS_SESSION_TOKEN: "10m",
    PRIVATE_ACCESS_SESSION_COOKIE: 10 * 60 * 1000, // 10 minutes in ms

    JWT_REFRESH_SESSION_TOKEN: "365d",
    JWT_REFRESH_REMEMBER_OFF_SESSION_TOKEN: "6h",
    REFRESH_SESSION_COOKIE: 365 * 25 * 60 * 60 * 1000, // 365 days in ms

    JWT_SIGNUP_SESSION_TOKEN: "10m", // 10 minutes in seconds (for email/username validation flow)
    SIGNUP_SESSION_COOKIE: 10 * 60 * 1000, // 10 minutes for cookie, in ms
    REDIS_SIGNUP_SESSION_TTL: 10 * 60, // Match signup session (10 min),

    JWT_SIGNUP_SESSION_TOKEN_EXTENDED: "30m", // 30 minutes in seconds (for post email-verification signup flow)
    SIGNUP_SESSION_COOKIE_EXTENDED: 30 * 60 * 1000, // 30 minutes for cookie, in ms
    REDIS_SIGNUP_SESSION_TTL_EXTENDED: 30 * 60, // Match signup session (30 min)
};