import { SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { AuthRepo } from '@/repo/auth-repo';
import { ClientData } from "@wohaai/types";
import { authLogger } from "@wohaai/telemetry";
import { AccessTokenPayload, AuthSessionPayload, createJwtToken, RefreshTokenPayload } from "@wohaai/security/jwt";
import { InvalidCredentialsError } from "@/errors/service-error";
import exp from "../../../../../packages/config/exp.json"
import { env } from "@wohaai/env-ts";


export interface SigninInitServiceParams {
  usernameOrEmail: {
    type: "username"; value: string;
  } | {
    type: "email"; value: string;
  };
}

export interface SigninInitServiceResponse {
  authSessionToken: string;
}

export interface CompleteSigninServiceParams {
  usernameOrEmail: {
    type: "username"; value: string;
  } | {
    type: "email"; value: string;
  };
  clientData: ClientData;
  password: string;
}

export interface CompleteSigninServiceResponse {
  profilePicURI?: string;
  userID: string;
  username: string;
  fullName?: string;
  email: string;
  dateOfBirth?: string;
  refreshToken: string;
  accessToken: string;
}

export class SigninService {

  constructor(private repo: AuthRepo) { }

  /**
   * Main signin business logic
   */
  public async init({
    usernameOrEmail,
  }: SigninInitServiceParams): Promise<SigninInitServiceResponse> {
    const user =
      await this.repo.getUserWithUsernameOrEmail(usernameOrEmail);

    if (user === null) throw new InvalidCredentialsError()

    const sessionID = crypto.randomUUID()
    const jti = crypto.randomUUID()

    const authSessionToken = createJwtToken<AuthSessionPayload>({
      payload: {
        sub: sessionID,
        jti
      },
      secret: env.JWT_AUTH_SECRET_KEY!,
      options: {
        expiresIn: exp.JWT_AUTH_SESSION_TOKEN
      } as SignOptions,
    })

    return {
      authSessionToken
    }
  }

  public async complete({
    usernameOrEmail,
    clientData,
    password
  }: CompleteSigninServiceParams): Promise<CompleteSigninServiceResponse> {

    const user =
      await this.repo.getUserWithUsernameOrEmail(usernameOrEmail);

    if (user === null) throw new InvalidCredentialsError()

    const hashedPassword = await argon2.hash(password);
    if (hashedPassword !== user.hashedPassword) throw new InvalidCredentialsError();

    const userSessionID = crypto.randomUUID();
    const refreshTokenJti = crypto.randomUUID();

    // Maybe we in future make a feature to save and use jti for further security.
    const refreshToken = createJwtToken<RefreshTokenPayload>({
      payload: {
        jti: refreshTokenJti,
        sub: user.userID,
        sid: userSessionID,
      },
      secret: env.JWT_AUTH_SECRET_KEY!,
      options: {
        expiresIn: exp.JWT_REFRESH_TOKEN
      } as SignOptions
    });

    /**
     * Persist session
     */
    const session = await this.repo.createUserSession({
      userID: user.userID,
      clientData,
      refreshToken,
      userSessionID,
    });

    authLogger.debug({
      message: "✅ [SESSION] Created new user session",
      userID: session.userID,
      ip: clientData.userIPAddress,
      device: clientData.userDeviceName,
    });

    const accessTokenJti = crypto.randomUUID();
    /**
     * Access token
     */
    const accessToken = createJwtToken<AccessTokenPayload>({
      payload: {
        jti: accessTokenJti,
        sub: user.userID,
        sid: session.userSessionID,
        role: "user"
      },
      secret: env.JWT_AUTH_SECRET_KEY!,
      options: {
        expiresIn: exp.JWT_ACCESS_TOKEN,
      } as SignOptions
    });

    return {
      profilePicURI: user.profilePicURI,
      userID: user.userID,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      refreshToken: refreshToken,
      accessToken: accessToken
    }
  }
}