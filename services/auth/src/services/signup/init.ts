import { randomUUID } from "crypto";
import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { authLogger } from "@packages/observability";
import { createJwtToken, SignupSessionPayload } from "@packages/jwt";
import { RedisHelper } from "@packages/redis";
import { AuthRepo } from '@/repo/auth-repo';
import { ConflictError } from "@packages/errors";
import { SignOptions } from "jsonwebtoken";
import { getSignupSession, setSignupSession } from "@/redis/redis";


export interface SignupInitServiceParams {
  usernameOrEmail: {
    type: "username"; value: string;
  } | {
    type: "email"; value: string;
  };
}

export interface SignupInitServiceResponse {
  signupSessionInit: boolean;
  alreadyExists: boolean;
  signupSessionToken: string;
}

/**
 * Service responsible for initializing signup/signin flow
 * using username or email.
 */
export class SignupInitService {
  constructor(
    private authRepo: AuthRepo,
  ) { }


  public async execute(
    { usernameOrEmail }: SignupInitServiceParams
  ): Promise<SignupInitServiceResponse> {
    const { type, value } = usernameOrEmail;

    const identifierType = type;
    const identifier: string = value;

    // Check existing user
    authLogger.debug(
      `🔎 Checking ${identifierType} availability: ${identifier}`
    );

    let userExists = await this.authRepo.findUserWithUsernameOrEmail(usernameOrEmail);

    if (userExists) throw new ConflictError(
      "conflict_error",
      "username or email already exixts"
    )

    // New user -> signup flow
    authLogger.debug(
      "🔐 Creating signup session token..."
    );

    const signupSessionID = randomUUID();
    const jti: string = randomUUID();

    const signupSessionToken = createJwtToken<SignupSessionPayload>({
      payload: {
        jti,
        sub: signupSessionID
      },
      secret: env.JWT_SIGNUP_SESSION_SECRET_KEY,
      options: {
        expiresIn: exp.JWT_SIGNUP_SESSION_TOKEN
      } as SignOptions
    });


    authLogger.debug(
      "💾 Caching pending signup session in Redis..."
    );

    await setSignupSession(
      signupSessionID,
      {
        username: identifierType === "username" ? identifier : undefined,
        email: identifierType === "email" ? identifier : undefined
      });

    authLogger.debug(
      await getSignupSession(signupSessionID)
    )

    authLogger.debug(
      `✅ ${identifierType} available and session initialized: ${identifier}`
    );

    return {
      signupSessionInit: true,
      alreadyExists: false,
      signupSessionToken
    };
  }
}