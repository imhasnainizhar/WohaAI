import argon2 from "argon2";
import { logger } from "@packages/observability";
import {
  getSignupSession,
  deleteSignupSession,

  getConfirmedEmailCache,
  deleteConfirmedEmailCache,

  deleteVerificationCodeCache,
} from "@/redis/redis";
import { UserProvisioningClient } from "@/clients/user-provision";
import { EmailVerificationRequiredError, MaliciousActivityError, SessionExpiredError } from "@packages/errors";


export interface SignupCompleteResponse {
    username: string;
    email: string;
    userID: string;
    profilePicURI?: string;
    firstName: string;
    lastName: string;
}

export class SignupCompleteService {
  constructor(
    private readonly userProvisioningClient:
      UserProvisioningClient
  ) {}

  /**
   * Final signup completion flow
   */
  async execute({
    signupSessionID
  }: {
    signupSessionID: string
  }): Promise<SignupCompleteResponse> {

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

      logger.info({
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

      logger.info({
        message:
          "Signup completed successfully",

        userID:
          createdUser.userID,

        username:
          createdUser.username,
      });

      return {
        ...createdUser
      }
  }
}