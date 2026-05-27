import { RefreshSessionResponse } from "@packages/contracts/auth";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@packages/prisma";
import { logger } from "@packages/observability";
import {
  ActiveSessionRecord,
} from "@/types/session";
import { InternalServerError, SessionExpiredError } from "@packages/errors";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "@packages/jwt";
import { RefreshSessionParams } from "@/types/service/params";
import { AuthRepo } from "@/repo/auth-repo";
import { randomUUID } from "node:crypto";
import { TokenJti } from "@/types/payload";
import { exp } from "@/config/exp";
import { env } from "@/config/env";


export class RefreshSessionService {
  constructor(private authRepo: AuthRepo) { }
  public async execute({
    refreshToken,
    userIPAddress,
  }: RefreshSessionParams): Promise<RefreshSessionResponse> {
    const {
      JWT_REFRESH_SECRET_KEY,
      JWT_ACCESS_SECRET_KEY,
    } = env;

    if (!JWT_REFRESH_SECRET_KEY || !JWT_ACCESS_SECRET_KEY) {
      throw new InternalServerError({ message: "refresh and access jwt keys not configured" });
    }

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

    const tokenJti = {
      refreshTokenJti: randomUUID(),
      accessTokenJti: randomUUID()
    }

      const refreshTokenPayload: RefreshTokenPayload = {
        sub: user.userID,
        jti: tokenJti.refreshTokenJti,
        userID: user.userID,
        userSessionID: session.userSessionID,
        emailVerified: true,
        email: user.email,
        username: user.username,
      };
  
      const newRefreshToken = jwt.sign(
        refreshTokenPayload,
        JWT_REFRESH_SECRET_KEY,
        {
          expiresIn:
            exp.JWT_REFRESH_SESSION_TOKEN,
        } as SignOptions
      );
  
      const accessPayload: AccessTokenPayload = {
        sub: user.userID,
        jti: tokenJti.accessTokenJti,
        userID: user.userID,
        userSessionID: session.userSessionID,
        emailVerified: true,
        email: user.email,
        username: user.username,
        role: "user",
      };
  
      const newAccessToken = jwt.sign(
        accessPayload,
        JWT_ACCESS_SECRET_KEY,
        {
          expiresIn:
            exp.JWT_ACCESS_SESSION_TOKEN,
        } as SignOptions
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