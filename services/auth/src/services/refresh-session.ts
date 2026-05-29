import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { authLogger } from "@packages/observability";
import {
  ActiveSessionRecord,
} from "@/types/session";
import { InternalServerError, SessionExpiredError } from "@packages/errors";
import {
  AccessTokenPayload,
  createJwtToken,
  RefreshTokenPayload,
} from "@packages/jwt";
import { AuthRepo } from "@/repo/auth-repo";
import { randomUUID } from "node:crypto";
import { exp } from "@/config/exp";
import { env } from "@/config/env";


export interface RefreshSessionServiceParams {
  refreshToken: string;
  userIPAddress: string;
}

export interface RefreshSessionServiceResponse {
  newRefreshToken: string;
  newAccessToken: string;
}

interface TokenJti {
  refreshTokenJti: string;
  accessTokenJti: string;
}

export class RefreshSessionService {
  constructor(private authRepo: AuthRepo) { }
  public async execute({
    refreshToken,
    userIPAddress,
  }: RefreshSessionServiceParams): Promise<RefreshSessionServiceResponse> {
    const {
      JWT_REFRESH_SECRET_KEY,
      JWT_ACCESS_SECRET_KEY,
    } = env;

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

    const tokenJti: TokenJti = {
      refreshTokenJti: randomUUID(),
      accessTokenJti: randomUUID()
    }

    const refreshTokenPayload: RefreshTokenPayload = {
      sub: user.userID,
      jti: tokenJti.refreshTokenJti,
      sid: session.userSessionID
    };

    const newRefreshToken = createJwtToken<RefreshTokenPayload>({
      payload: refreshTokenPayload,
      secret: JWT_REFRESH_SECRET_KEY,
      options: {
        expiresIn:
          exp.JWT_REFRESH_TOKEN,
      } as SignOptions
    });

    const accessPayload: AccessTokenPayload = {
      sub: user.userID,
      jti: tokenJti.accessTokenJti,
      sid: session.userSessionID,
      role: "user",
    };

    const newAccessToken = createJwtToken<AccessTokenPayload>({
      payload: accessPayload,
      secret: JWT_ACCESS_SECRET_KEY,
      options: {
        expiresIn:
          exp.JWT_ACCESS_TOKEN,
      } as SignOptions
    });

    await this.rotateSession(
      payload.userSessionID,
      newRefreshToken,
      userIPAddress
    );

    authLogger.debug(
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
      authLogger.error(
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
      authLogger.error(
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
      await this.authRepo.refreshSession({
        userSessionID,
        refreshToken,
        ip
      })
    } catch (err: unknown) {
      throw new InternalServerError(err)
    }
  }
}