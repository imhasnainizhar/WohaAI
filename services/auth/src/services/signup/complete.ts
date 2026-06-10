import { authLogger } from "@packages/observability";
import {
  getSignupSession,
  deleteSignupSession,

  getConfirmedEmailCache,
  deleteConfirmedEmailCache,

  deleteVerificationCodeCache,
} from "@/redis/redis";
import { UserProvisioningClient } from "@/clients/user-provision";
import { MaliciousActivityError, SessionExpiredError } from "@packages/errors";
import { AccessTokenPayload, createJwtToken, RefreshTokenPayload } from "@packages/jwt";
import { randomUUID } from "crypto";
import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { SignOptions } from "jsonwebtoken";
import { ClientData, DateOfBirth } from "@packages/contracts/auth";


import { AuthRepo } from "@/repo/auth-repo";
import { EmailVerificationRequiredError } from "@/errors/service-error";

export interface SignupCompleteServiceParams {
  signupSessionID: string;
  clientData: ClientData
}

export interface SignupCompleteServiceResponse {
  username: string;
  email: string;
  id: string;
  profilePicURI?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: DateOfBirth;
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

      dateOfBirth: session.dateOfBirth!,
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
        sub: createdUser.id
      },
      secret: env.JWT_REFRESH_SECRET_KEY,
      options: {
        expiresIn: exp.JWT_REFRESH_TOKEN
      } as SignOptions
    })

    const accessToken = createJwtToken<AccessTokenPayload>({
      payload: {
        jti: randomUUID(),
        sid: userSessionID,
        sub: createdUser.id,
        role: "user"
      },
      secret: env.JWT_ACCESS_SECRET_KEY,
      options: {
        expiresIn: exp.JWT_ACCESS_TOKEN
      } as SignOptions
    })

    /**
     * Persist session
     */
    await this.authRepo.createUserSession({
      id: createdUser.id,
      clientData,
      refreshToken,
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

      id:
        createdUser.id,

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