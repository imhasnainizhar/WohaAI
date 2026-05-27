import { RefreshTokenRequest } from "@packages/contracts/auth";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@packages/prisma";
import { logger } from "@packages/observability";
import { envConfigs as env, EXPIRATION } from "@packages/config";
import {
  ActiveSessionRecord,
  ActiveSessionSelect,
} from "@/types/session";
import { SessionExpiredError } from "@packages/errors";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "@packages/jwt";
import {
  ServiceException,
  ServiceResponse,
} from "@packages/http";

export class RefreshTokenService {
  public static async execute<T>({
    cookies,
    userIPAddress,
  }: RefreshTokenRequest): Promise<ServiceResponse<T>> {
    try {
      const {
        JWT_REFRESH_SECRET_KEY,
        JWT_ACCESS_SECRET_KEY,
      } = env;

      this.validateEnv(
        JWT_REFRESH_SECRET_KEY,
        JWT_ACCESS_SECRET_KEY
      );

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

      return ServiceResponse.success<T>({
        success: true,
        statusCode: 200,
        message: "Tokens refreshed successfully.",
        data: {
          newAccessToken,
          newRefreshToken,
        } as T,
      });
    } catch (err: any) {
      if (err instanceof ServiceException) throw err;

      logger.error("Unhandled refresh token error" + {
        message: err?.message,
        stack: err?.stack,
      });

      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Internal server error",
          errorType: "internal_server_error",
        })
      );
    }
  }

  // ----------------------------
  // Helpers
  // ----------------------------

  private static validateEnv(
    refreshKey?: string,
    accessKey?: string
  ) {
    if (!refreshKey || !accessKey) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message:
            "Server misconfiguration: JWT keys missing.",
          errorType: "token_error",
        })
      );
    }
  }

  private static extractRefreshToken(
    cookies: RefreshTokenRequest["cookies"]
  ): string {
    const cookieName = env.REFRESH_TOKEN_NAME;

    const cookie = cookies.find(
      (c) => c.name === cookieName
    );

    if (!cookie?.value) {
      throw new SessionExpiredError();
    }

    return cookie.value;
  }

  private static verifyToken(
    token: string,
    secret: string
  ): JwtPayload & {
    sub: string;
    userSessionID: string;
  } {
    try {
      const decoded = jwt.verify(token, secret);
      const payload =
        typeof decoded === "string" ? null : decoded;

      if (!payload?.sub || !payload?.userSessionID) {
        throw new SessionExpiredError();
      }

      return payload as any;
    } catch (e: any) {
      if (e.name === "TokenExpiredError") {
        throw new SessionExpiredError();
      }

      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Invalid refresh token.",
          errorType: "invalid_token",
        })
      );
    }
  }

  private static async getActiveSession(
    payload: {
      sub: string;
      userSessionID: string;
    }
  ): Promise<ActiveSessionRecord> {
    try {
      const session =
        await prisma.userSession.findFirst({
          where: {
            userID: payload.sub,
            userSessionID: payload.userSessionID,
            revoked: false,
          },
          select: ActiveSessionSelect,
        });

      if (
        !session?.refreshTokenHash ||
        !session.user
      ) {
        throw new ServiceException(
          ServiceResponse.error({
            success: false,
            statusCode: 404,
            message:
              "Session not found or token invalid.",
            errorType: "user_not_found",
          })
        );
      }

      return session;
    } catch (e: any) {
      logger.error(
        "DB query failed during refresh",
        e
      );

      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Database query failed.",
          errorType: "database_error",
        })
      );
    }
  }

  private static async verifyRefreshTokenHash(
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

      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Token verification failed.",
          errorType: "hash_error",
        })
      );
    }
  }

  private static async issueTokens(
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

    const newRefreshToken = jwt.sign(
      refreshTokenPayload,
      refreshSecret,
      {
        expiresIn:
          EXPIRATION.JWT_REFRESH_SESSION_TOKEN,
      } as SignOptions
    );

    return { newAccessToken, newRefreshToken };
  }

  private static async rotateSession(
    userSessionID: string,
    refreshToken: string,
    ip: string
  ) {
    const hash = await argon2.hash(refreshToken);

    await prisma.userSession.update({
      where: { userSessionID },
      data: {
        refreshTokenHash: hash,
        revokedAt: null,
        userIPAddress: ip,
      },
    });
  }
}