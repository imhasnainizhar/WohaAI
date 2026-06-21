import keys from "../../../packages/config/redis-keys.json";

export const redisKeys = {
  authSession: (sessionID: string) =>
    `${keys.AUTH_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,

  verificationCode: (email: string) =>
    `${keys.VERIFICATION_CODE_REDIS_KEY_PREFIX}:${email}`,

  confirmedEmail: (sessionID: string) =>
    `${keys.CONFIRMED_EMAIL_REDIS_KEY_PREFIX}:${sessionID}`,

  changeEmailSession: (sessionID: string) =>
    `${keys.CHANGE_EMAIL_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,

  changePasswordSession: (sessionID: string) =>
    `${keys.CHANGE_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
} as const;