import {
  deleteForgotPasswordSessionCache,
  getForgotPasswordSessionCache,
  setForgotPasswordSessionCache
} from "@/redis/redis";

import { randomUUID } from "crypto";
import { env } from "@/config/env";
import { createJwtToken, ForgotPasswordSessionPayload } from "@packages/jwt";
import { exp } from "@/config/exp";
import { SignOptions } from "jsonwebtoken";
import { getForgotPasswordProducer } from "@/producer/forgot-password";
import { ForgotPasswordEmailEvent } from "@packages/contracts/mailer";
import argon2 from "argon2"
import {
  InvalidCredentialsError,
  MaliciousActivityError,
  SessionExpiredError
} from "@packages/errors";

import { AuthRepo } from "@/repo/auth-repo";
import { Password } from "@packages/contracts/auth";
import { authLogger } from "@packages/observability";
import { ForgotPasswordInitRequest } from '@packages/contracts/auth';


// init()
export interface ForgotPasswordInitServiceParams {
  parsed: ForgotPasswordInitRequest;
}
export interface ForgotPasswordInitServiceResponse {
  forgotPasswordEmailSent: boolean;
}

// verify()
export interface VerifyForgotPasswordServiceParams {
  sessionID: string;
}
export interface VerifyForgotPasswordServiceResponse {
  forgotPasswordSessionToken: string;
  redirectTo: string;
}

//changePassword()
export interface ChangeForgottenPasswordServiceParams {
  sessionID: string;
  password: Password;
}
export interface ChangeForgottenPasswordServiceResponse {
  forgottenPasswordChanged: boolean;
}

export class ForgotPasswordService {
  constructor(private authRepo: AuthRepo) { }

  public async init({
    parsed
  }: ForgotPasswordInitServiceParams): Promise<ForgotPasswordInitServiceResponse> {

    // user session validaiton happens at handler

    // prisma check
    const foundUser = 
      await this.authRepo.getUserWithUsernameOrEmail(parsed.forgotPasswordUsernameOrEmail)

    if (!foundUser) throw new InvalidCredentialsError();

    const sessionID = randomUUID();

    await setForgotPasswordSessionCache({
      sessionID,
      userID: foundUser.userID,
      email: foundUser.email,
      username: foundUser.username,
      createdOn: new Date()
    })

    // create producer to push events on kafka
    const producer = await getForgotPasswordProducer();

    const event: ForgotPasswordEmailEvent = {
      sessionID,
      userID: foundUser.userID,
      username: foundUser.username,
      email: foundUser.email,
      uriSessionToken: `http://localhost:8001/verify-forgot-password-session?sessionId=${sessionID}`,
      createdOn: new Date()
    }

    // Push event on kafka
    // produce email event on kafka
    await producer.send({
      topic: env.AUTH_KAFKA_FORGOT_PASSWORD_EVENTS_TOPIC,
      messages: [
        {
          value: JSON.stringify(event),
        },
      ],
    });

    return {
      forgotPasswordEmailSent: true
    }
  }

  public async verify({
    sessionID
  }: VerifyForgotPasswordServiceParams): Promise<VerifyForgotPasswordServiceResponse> {
    const key = `${env.FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`;

    // error handling is already done in redisHelpers methods.
    const cache = await getForgotPasswordSessionCache(key);
    if(!cache) throw new SessionExpiredError()
      
    // one-time use
    await deleteForgotPasswordSessionCache(key);

    const jti = randomUUID()

    const token = createJwtToken<ForgotPasswordSessionPayload>({
      payload: {
        jti,
        sub: sessionID
      },
      secret: env.JWT_FORGOT_PASSWORD_SESSION_SECRET_KEY,
      options: {
        expiresIn: exp.JWT_FORGOT_PASSWORD_SESSION_SECRET_KEY
      } as SignOptions
    })

    return {
      forgotPasswordSessionToken: token,
      redirectTo: "/change-forgotten-password",
    };
  }

  // This is our new method of typing things related to user using types of zod schemas from @packages/contracts/auth
  // ForgotPasswordSessionToken will be validated at handler after being extracted from session cookie. 
  public async changePassword({
    sessionID,
    password
  }: ChangeForgottenPasswordServiceParams): Promise<ChangeForgottenPasswordServiceResponse> {
    const key = `${env.FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`;

    // error handling is already done in redisHelpers methods.
    const cache = 
      await getForgotPasswordSessionCache(key);
      
    if(!cache) throw new SessionExpiredError()

    const userID = cache.userID;

    const hashedPassword = await argon2.hash(password);

    const result = 
      await this.authRepo.changeUserPassword({ userID, hashedPassword })

    authLogger.debug(`Forgotten password changed for userID: ${result.userID}, username: ${result.username}`)

    return {
      forgottenPasswordChanged: true
    }
  }
}