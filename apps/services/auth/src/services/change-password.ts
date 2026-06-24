import { randomUUID } from "crypto";
import { createJwtToken, ChangePasswordSessionPayload } from "@wohaai/security/jwt";
import { SignOptions } from "jsonwebtoken";
import { getChangePasswordProducer } from "@/producer/change-password";
import { ChangePasswordEvent } from "@wohaai/types";
import argon2 from "argon2"
import {
  SessionExpiredError
} from "@wohaai/errors";

import { AuthRepo } from "@/repo/auth-repo";
import { TPassword, TUsernameOrEmail } from "@wohaai/validations";
import { authLogger } from "@wohaai/telemetry";
import { InvalidCredentialsError } from "@/errors/service-error";
import { getChangePasswordSessionCache, setChangePasswordSessionCache } from "@/redis/redis";
import exp from "../../../../../packages/config/exp.json"
import { env } from "@wohaai/env-ts";
import kafka from "../../../../../packages/config/kafka.json"

// init()
export interface ChangePasswordInitServiceParams {
  usernameOrEmail: TUsernameOrEmail;
}

export interface VerifyChangePasswordServiceParams {
  sessionID: string;
}
export interface VerifyChangePasswordServiceResponse {
  changePasswordSessionToken: string;
}

export interface CompleteChangePasswordServiceResponse {
  sessionID: string;
  password: TPassword;
}

export class ChangePasswordService {
  constructor(private authRepo: AuthRepo) { }

  public async init({
    usernameOrEmail
  }: ChangePasswordInitServiceParams): Promise<{ success: boolean }> {

    // user session validation happens at handler

    // db check
    const foundUser =
      await this.authRepo.getUserWithUsernameOrEmail(usernameOrEmail)

    if (!foundUser) throw new InvalidCredentialsError();

    const sessionID = randomUUID();

    await setChangePasswordSessionCache({
      sessionID,
      userID: foundUser.userID,
      email: foundUser.email,
      username: foundUser.username,
      createdOn: new Date()
    })

    // create producer to push events on kafka
    const producer = await getChangePasswordProducer();

    const event: ChangePasswordEvent = {
      sessionID,
      userID: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      uriSessionToken: `http://localhost:8001/verify-forgot-password-session?sessionID=${sessionID}`,
      createdOn: new Date()
    }

    // Push event on kafka
    // produce email event on kafka
    await producer.send({
      topic: kafka.topics.changePassword,
      messages: [
        {
          value: JSON.stringify(event),
        },
      ],
    });

    return {
      success: true
    }
  }

  public async verify({
    sessionID
  }: VerifyChangePasswordServiceParams): Promise<VerifyChangePasswordServiceResponse> {

    const jti = randomUUID()

    const token = createJwtToken<ChangePasswordSessionPayload>({
      payload: {
        jti,
        sub: sessionID
      },
      secret: env.JWT_AUTH_SECRET_KEY,
      options: {
        expiresIn: exp.JWT_AUTH_SESSION_TOKEN
      } as SignOptions
    })

    return {
      changePasswordSessionToken: token,
    };
  }

  // This is our new method of typing things related to user using types of zod schemas from @wohaai/validations
  // ChangePasswordSessionToken will be validated at handler after being extracted from session cookie. 
  public async complete({
    sessionID,
    password
  }: CompleteChangePasswordServiceResponse): Promise<{ success: boolean }> {

    // error handling is already done in redisClient methods.
    const cache =
      await getChangePasswordSessionCache(sessionID);

    if (!cache) throw new SessionExpiredError()

    const userID = cache.userID;

    const hashedPassword = await argon2.hash(password);

    const result =
      await this.authRepo.changeUserPassword({ userID, hashedPassword })

    authLogger.debug(`Password changed for userID: ${result.userID}, username: ${result.username}`)

    return {
      success: true
    }
  }
}