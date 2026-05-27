import { RefreshSessionResponse } from "@packages/contracts/auth";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@packages/prisma";
import { logger } from "@packages/observability";
import { envConfigs as env, EXPIRATION } from "@packages/config";
import {
  ActiveSessionRecord,
  ActiveSessionSelect,
} from "@/types/session";
import { InternalServerError, SessionExpiredError } from "@packages/errors";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "@packages/jwt";
import { RefreshSessionParams } from "@/types/service/params";
import { AuthRepo } from "@/repo/AuthRepo";


export class RefreshSessionService {
  constructor(private authRepo: AuthRepo) { }
  public async execute({
    cookies,
    userIPAddress,
  }: RefreshSessionParams): Promise<RefreshSessionResponse> {
    const {
      JWT_REFRESH_SECRET_KEY,
      JWT_ACCESS_SECRET_KEY,
    } = env;

    if (!JWT_REFRESH_SECRET_KEY || !JWT_ACCESS_SECRET_KEY) {
      throw new InternalServerError({ message: "refresh and access jwt keys not configured" });
    }

    const refreshToken =
      this.extractRefreshToken(cookies);

    const payload = this.verifyToken(
      refreshToken,
      JWT_REFRESH_SECRET_KEY
    );

    const session =
      await this.getActiveSession(payload);

    await this.verifyRefreshTokenHash(
      session.refreshTokenHash,
      refreshToken
    );

    const user = session.user;

    const { newAccessToken, newRefreshToken } =
      await this.issueTokens(
        user,
        payload.userSessionID,
        JWT_ACCESS_SECRET_KEY,
        JWT_REFRESH_SECRET_KEY
      );

    await this.rotateSession(
      payload.userSessionID,
      newRefreshToken,
      userIPAddress
    );

    logger.debug(
      `Tokens rotated successfully for userID: ${user.userID}`
    );

    return {
      newRefreshToken,
      newAccessToken,
    }
  }

  // ----------------------------
  // Helper Methods
  // ----------------------------

  private extractRefreshToken(
    cookies: RefreshSessionParams["cookies"]
  ): string {
    const cookieName = env.REFRESH_TOKEN_NAME;

    const cookie = cookies.find(
      (c) => c.name === cookieName
    );

    if (!cookie?.value) throw new SessionExpiredError();

    return cookie.value;
  }

  private verifyToken(
    token: string,
    secret: string
  ): JwtPayload & {
    sub: string;
    userSessionID: string;
  } {
    const decoded = jwt.verify(token, secret);
    const payload =
      typeof decoded === "string" ? null : decoded;

    if (!payload?.sub || !payload?.userSessionID) {
      throw new SessionExpiredError();
    }

    return payload as any;
  }

  private async getActiveSession(
    payload: {
      sub: string;
      userSessionID: string;
    }
  ): Promise<ActiveSessionRecord> {
    try {
      const session =
        await this.authRepo.findActiveSession({
          userID: payload.sub,
          userSessionID: payload.userSessionID
        });

      if (
        !session?.refreshTokenHash ||
        !session
      ) {
        throw new SessionExpiredError();
      }

      return session;
    } catch (e: any) {
      logger.error(
        "DB query failed during refresh",
        e
      );

      throw new InternalServerError({ message: "DB query failed during session refresh" })
    }
  }

  private async verifyRefreshTokenHash(
    hash: string,
    token: string
  ) {
    try {
      const valid = await argon2.verify(hash, token);

      if (!valid) {
        throw new SessionExpiredError();
      }
    } catch (e: any) {
      logger.error(
        "Argon2 verification failed",
        e
      );

      throw new InternalServerError({ message: "Internal server faliure due to argon" })
    }
  }

  private async issueTokens(
    user: any,
    userSessionID: string,
    accessSecret: string,
    refreshSecret: string
  ) {
    const refreshTokenPayload: RefreshTokenPayload =
    {
      sub: user.userID,
      jti: crypto.randomUUID(),
      userID: user.userID,
      userSessionID,
      emailVerified: true,
      email: user.email,
      username: user.username,
    };

    const newRefreshToken = jwt.sign(
      refreshTokenPayload,
      refreshSecret,
      {
        expiresIn:
          EXPIRATION.JWT_REFRESH_SESSION_TOKEN,
      } as SignOptions
    );

    const accessPayload: AccessTokenPayload = {
      sub: user.userID,
      jti: crypto.randomUUID(),
      userID: user.userID,
      userSessionID,
      emailVerified: true,
      email: user.email,
      username: user.username,
      role: "user",
    };

    const newAccessToken = jwt.sign(
      accessPayload,
      accessSecret,
      {
        expiresIn:
          EXPIRATION.JWT_ACCESS_SESSION_TOKEN,
      } as SignOptions
    );

    return { newAccessToken, newRefreshToken };
  }

  private async rotateSession(
    userSessionID: string,
    refreshToken: string,
    ip: string
  ) {
    const hash = await argon2.hash(refreshToken);

    try {
      await prisma.userSession.update({
        where: { userSessionID },
        data: {
          refreshTokenHash: hash,
          revokedAt: null,
          userIPAddress: ip,
        },
      });
    } catch (err: unknown) {
      throw new InternalServerError(err)
    }

  }
}