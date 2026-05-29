import jwt, { SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { envConfigs as env, EXPIRATION } from "@packages/config";
import { AuthRepo } from '@/repo/auth-repo';
import { InternalServerError, InvalidCredentialsError } from "@packages/errors";
import { authLogger } from "@packages/observability";
import { AccessTokenPayload, createJwtToken, RefreshTokenPayload } from "@packages/jwt";
import { exp } from "@/config/exp";

/**
 * Taking SessionDuration from @packages/prisma UserSession Model export
 */
import { SessionDuration } from "@packages/prisma";


export interface SigninServiceParams {
  usernameOrEmail: {
    type: "username"; value: string;
  } | {
    type: "email"; value: string;
  };
  password: string;
  rememberMe: boolean;
  clientData: ClientData;
}

export interface SigninServiceResponse {
  profilePicURI: string;
  userID: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  refreshToken: string;
  accessToken: string;
}

export class SigninService {

  constructor(private repo: AuthRepo) { }

  /**
   * Main signin business logic
   */
  public async execute({
    usernameOrEmail,
    password,
    rememberMe,
    clientData
  }: SigninServiceParams): Promise<SigninServiceResponse> {
    const user =
      await this.repo.getUserWithUsernameOrEmail(usernameOrEmail);

    if (user === null) throw new InvalidCredentialsError()

    const isPasswordCorrect = await argon2.verify(
      user.hashedPassword,
      password
    );

    if (!isPasswordCorrect) throw new InvalidCredentialsError

    const {
      JWT_ACCESS_SECRET_KEY,
      JWT_REFRESH_SECRET_KEY,
    } = this.getJWTSecrets();

    const userSessionID = crypto.randomUUID();
    const refreshTokenJti = crypto.randomUUID();

    // Maybe we in future make a feature to save and use jti for further security.
    const refreshToken = createJwtToken<RefreshTokenPayload>({
      payload: {
        jti: refreshTokenJti,
        sub: user.userID,
        sid: userSessionID,
      },
      secret: JWT_REFRESH_SECRET_KEY,
      options: {
        expiresIn: rememberMe? exp.JWT_REFRESH_TOKEN : exp.JWT_REFRESH_REMEMBER_OFF_TOKEN
      } as SignOptions
    });

    const sessionDuration: SessionDuration = rememberMe ? "persistent" : "temporary"

    /**
     * Persist session
     */
    const session = await this.repo.createUserSession({
      userID: user.userID,
      clientData,
      refreshToken,
      sessionDuration,
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
      secret: JWT_ACCESS_SECRET_KEY,
      options: {
        expiresIn: exp.JWT_ACCESS_TOKEN,
      } as SignOptions
    });

    return {
      profilePicURI: user.profilePicURI || "",
      userID: user.userID,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      refreshToken,
      accessToken
    }
  }

  /**
   * Validate JWT secrets existence
   */
  private getJWTSecrets() {
    const {
      JWT_ACCESS_SECRET_KEY,
      JWT_REFRESH_SECRET_KEY,
    } = env;

    if (
      !JWT_ACCESS_SECRET_KEY ||
      !JWT_REFRESH_SECRET_KEY
    ) {
      throw new InternalServerError({ message: "JWT keys misconfiguration" })
    }

    return {
      JWT_ACCESS_SECRET_KEY,
      JWT_REFRESH_SECRET_KEY,
    };
  }
}