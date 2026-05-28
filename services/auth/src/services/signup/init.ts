import { randomUUID } from "crypto";
import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { logger } from "@packages/observability";
import { createJwtToken } from "@packages/jwt";
import { RedisHelper } from "@packages/redis";
import { AuthRepo } from '@/repo/auth-repo';
import { ConflictError } from "@packages/errors";
import { SignupInitResponse, SignupSessionID } from "@packages/contracts/auth";


export interface SignupInitParams {
  usernameOrEmail: {
      type: "username"; value: string;
  } | {
      type: "email"; value: string;
  };
}

/**
 * Service responsible for initializing signup/signin flow
 * using username or email.
 */
export class SignupInitService {
  constructor(
    private authRepo: AuthRepo,
    private redisHelpers: RedisHelper
  ) { }


  public async execute(
    { usernameOrEmail }: SignupInitParams
  ): Promise<SignupInitResponse> {
    const { type, value } = usernameOrEmail;

    const identifierType = type;
    const identifier: string = value;

    // Check existing user
    logger.debug(
      `🔎 Checking ${identifierType} availability: ${identifier}`
    );

    let userExists = await this.authRepo.findUserWithUsernameOrEmail(usernameOrEmail);

    if (userExists) throw new ConflictError(
      "conflict_error",
      "username or email already exixts"
    )

    // New user -> signup flow
    logger.debug(
      "🔐 Creating signup session token..."
    );

    const signupSessionID: SignupSessionID = randomUUID();
    const jti: string = randomUUID();
    const signupSessionToken = createJwtToken(
      {
        jti,
        sub: signupSessionID,
      },
      env.JWT_SIGNUP_SESSION_SECRET_KEY,
      {
        expiresIn: Number(
          exp.SIGNUP_SESSION_COOKIE
        ),
      }
    );

    logger.debug(
      "💾 Caching pending signup session in Redis..."
    );

    const tempUser = {
      [identifierType]: identifier,
    };

    await this.redisHelpers.setCache(
      `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSessionID}`,
      JSON.stringify(tempUser),
      exp.REDIS_SIGNUP_SESSION_TTL
    );

    logger.debug(
      `✅ ${identifierType} available and session initialized: ${identifier}`
    );

    return {
        identifierType,
        identifier,
        already_exists: false,
        signupSessionToken
    };
  }
}