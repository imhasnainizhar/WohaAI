import { authLogger } from "@packages/observability";
import {
  getSignupSession,
  deleteSignupSession,

  getConfirmedEmailCache,
  deleteConfirmedEmailCache,

  deleteVerificationCodeCache,
} from "@/redis/redis";
import { UserProvisioningClient } from "@/clients/user-provision";
import { EmailVerificationRequiredError, MaliciousActivityError, SessionExpiredError } from "@packages/errors";
import { AccessTokenPayload, createJwtToken, RefreshTokenPayload } from "@packages/jwt";
import { randomUUID } from "crypto";
import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { SignOptions } from "jsonwebtoken";
import { ClientData } from "@packages/contracts/auth";

/**
 * Taking SessionDuration from @packages/prisma-users UserSession Model export
 */
import { SessionDuration } from "@packages/prisma-users";
import { AuthRepo } from "@/repo/auth-repo";

export interface SignupCompleteServiceParams {
  signupSessionID: string;
  rememberMe: boolean;
  clientData: ClientData
}

export interface SignupCompleteServiceResponse {
  username: string;
  email: string;
  userID: string;
  profilePicURI?: string;
  firstName: string;
  lastName: string;
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
    signupSessionID,
    rememberMe,
    clientData
  }: SignupCompleteServiceParams): Promise<SignupCompleteServiceResponse> {

    // fetch signup session
    const session = await getSignupSession(signupSessionID)

    if (!session) throw new SessionExpiredError()

    // verify confirmed email state
    const confirmedEmail =
      await getConfirmedEmailCache(signupSessionID);

    if (!confirmedEmail) throw new MaliciousActivityError();

    // verify session integrity
    if (
      session.email !== confirmedEmail
    ) throw new EmailVerificationRequiredError()

    // prepare user payload
    const userPayload = {
      username: session.username!,
      email: session.email!,

      firstName:
        session.firstName!,

      lastName:
        session.lastName!,

      hashedPassword: session.hashedPassword!,
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

    const userSessionID = randomUUID();

    const refreshToken = createJwtToken<RefreshTokenPayload>({
      payload: {
        jti: randomUUID(),
        sid: userSessionID,
        sub: createdUser.userID
      },
      secret: env.JWT_REFRESH_SECRET_KEY,
      options: {
        expiresIn: rememberMe ? exp.JWT_REFRESH_TOKEN : exp.JWT_REFRESH_REMEMBER_OFF_TOKEN
      } as SignOptions
    })

    const accessToken = createJwtToken<AccessTokenPayload>({
      payload: {
        jti: randomUUID(),
        sid: userSessionID,
        sub: createdUser.userID,
        role: "user"
      },
      secret: env.JWT_ACCESS_SECRET_KEY,
      options: {
        expiresIn: exp.JWT_ACCESS_TOKEN
      } as SignOptions
    })

    const sessionDuration: SessionDuration = rememberMe ? "persistent" : "temporary"

    /**
     * Persist session
     */
    await this.authRepo.createUserSession({
      userID: createdUser.userID,
      clientData,
      refreshToken,
      sessionDuration,
      userSessionID,
    });

    // cleanup temporary state
    await Promise.all([
      deleteSignupSession(
        signupSessionID
      ),

      deleteConfirmedEmailCache(
        signupSessionID
      ),

      deleteVerificationCodeCache(
        signupSessionID
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