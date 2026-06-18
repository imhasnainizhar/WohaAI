import { authLogger } from "@wohaai/telemetry";
import {
  getAuthSession,
  deleteAuthSession,
  deleteVerificationCodeCache,
} from "@/redis/redis";
import { UserProvisioningClient } from "@wohaai/lib";
import { MaliciousActivityError, SessionExpiredError } from "@wohaai/errors";
import { AccessTokenPayload, createJwtToken, RefreshTokenPayload } from "@wohaai/security/jwt";
import { randomUUID } from "crypto";
import { env } from "@wohaai/env-ts";
import exp from "../../../../../../packages/config/exp.json";
import { SignOptions } from "jsonwebtoken";
import { ClientData } from "@wohaai/types";
import { AuthRepo } from "@/repo/auth-repo";
import { EmailVerificationRequiredError } from "@/errors/service-error";

export interface SignupCompleteServiceParams {
  authSessionID: string;
  authToken: string;
  clientData: ClientData
}

export interface SignupCompleteServiceResponse {
  username: string;
  email: string;
  userID: string;
  refreshToken: string;
  accessToken: string;
}

export class SignupCompleteService {
  constructor(
    private readonly authRepo: AuthRepo,
    private readonly userProvisioningClient:
      UserProvisioningClient
  ) { }

  /**
   * Final signup completion flow
   */
  async execute({
    authSessionID,
    authToken,
    clientData
  }: SignupCompleteServiceParams): Promise<SignupCompleteServiceResponse> {

    // fetch signup session
    const session = await getAuthSession(authSessionID)

    if (!session) throw new SessionExpiredError()

    if (!session.emailVerified) throw new MaliciousActivityError();

    // verify session integrity
    if (
      session.email !== session.email
    ) throw new EmailVerificationRequiredError()

    if (
      !session.hashedPassword ||
      !session.email ||
      !session.username ||
      !session.emailVerified
    ) {
      authLogger.warn({
        message: "Session integrity check failed",
        session: {
          hashedPassword: !!session.hashedPassword,
          email: !!session.email,
          username: !!session.username,
          emailVerified: session.emailVerified,
        },
      });
      throw new MaliciousActivityError();
    }

    // prepare user payload
    const userPayload = {
      username: session.username,
      email: session.email,
      hashedPassword: session.hashedPassword,
      authToken: authToken,
    };

    authLogger.info({
      message:
        "Creating user through provisioning service",

      username:
        userPayload.username,

      email:
        userPayload.email,
    });

    /**
     * Future:
     * REST / gRPC / Kafka / NATS
     */
    const createdUser =
      await this.userProvisioningClient
        .createUser(userPayload);

    authLogger.debug("User created")

    const userSessionID = randomUUID();

    const refreshToken = createJwtToken<RefreshTokenPayload>({
      payload: {
        jti: randomUUID(),
        sid: userSessionID,
        sub: createdUser.userID
      },
      secret: env.JWT_AUTH_SECRET_KEY,
      options: {
        expiresIn: exp.JWT_REFRESH_TOKEN
      } as SignOptions
    })

    const accessToken = createJwtToken<AccessTokenPayload>({
      payload: {
        jti: randomUUID(),
        sid: userSessionID,
        sub: createdUser.userID,
        role: "user"
      },
      secret: env.JWT_AUTH_SECRET_KEY,
      options: {
        expiresIn: exp.JWT_ACCESS_TOKEN
      } as SignOptions
    })

    /**
     * Persist session
     */
    await this.authRepo.createUserSession({
      userID: createdUser.userID,
      clientData,
      refreshToken,
      userSessionID,
    });

    // cleanup temporary state
    await Promise.all([
      deleteAuthSession(
        authSessionID
      ),

      deleteVerificationCodeCache(
        authSessionID
      ),
    ]);

    authLogger.info({
      message:
        "Signup completed successfully",

      userID:
        createdUser.userID,

      username:
        createdUser.username,
    });

    return {
      ...createdUser,
      refreshToken,
      accessToken
    }
  }
}