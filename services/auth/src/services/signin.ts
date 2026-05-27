import jwt, { SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { envConfigs as env, EXPIRATION } from "@packages/config";
import { createUserSession } from "@/helpers/create-user-session";
import { AuthRepo } from "@/repo/auth-repo";
import { InternalServerError,InvalidCredentialsError } from "@packages/errors";
import { SigninResponse } from "@packages/contracts/auth";
import { SigninParams } from "@/types/service/params";
import { UserSessionID } from "@packages/contracts/auth";

export class SigninService {

  constructor(private repo: AuthRepo) { }

  /**
   * Main signin business logic
   */
  public async execute({
    usernameOrEmail,
    password,
    clientData,
  }: SigninParams): Promise<SigninResponse> {
    const user = await this.repo.getUserWithUsernameOrEmail(usernameOrEmail.value);

    if(user === null) throw new InvalidCredentialsError()

    const isPasswordCorrect = await argon2.verify(
      user.hashedPassword,
      password
    );

    if (!isPasswordCorrect) throw new InvalidCredentialsError

    const {
      JWT_ACCESS_SECRET_KEY,
      JWT_REFRESH_SECRET_KEY,
    } = this.getJWTSecrets();

    const userSessionID: UserSessionID = crypto.randomUUID();

    /**
     * Initial refresh token
     */
    const refreshToken = jwt.sign(
      {
        sub: user.userID,
        userSessionID,
      },
      JWT_REFRESH_SECRET_KEY,
      {
        expiresIn: EXPIRATION.JWT_REFRESH_SESSION_TOKEN,
      } as SignOptions
    );

    /**
     * Persist session
     */
    const session = await createUserSession({
      userID: user.userID,
      clientData,
      refreshToken,
      userSessionID,
    });

    /**
     * Access token
     */
    const accessToken = jwt.sign(
      {
        sub: user.userID,
        email: user.email,
        name: `${user.userFirstName} ${user.userLastName}`,
        userSessionID: session.userSessionID,
      },
      JWT_ACCESS_SECRET_KEY,
      {
        expiresIn: EXPIRATION.JWT_ACCESS_SESSION_TOKEN,
      } as SignOptions
    );

    return {
      profilePicURI: user.profilePicURI || "",
      userID: user.userID,
      firstName: user.userFirstName,
      lastName: user.userLastName,
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