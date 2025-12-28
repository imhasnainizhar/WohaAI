// tests/services/refreshToken.service.test.ts

import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@utils/prisma";
import { refreshTokenService } from "@services/refresh_token";
import { ServiceException } from "../../src/utils/response";

// MOCKS
jest.mock("jsonwebtoken");
jest.mock("argon2");
jest.mock("@utils/prisma_client", () => ({
  prisma: {
    userSession: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@utils/logger", () => ({
  logger: {
    fatal: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// ENV
process.env.JWT_REFRESH_SECRET_KEY = "refresh-secret";
process.env.JWT_ACCESS_SECRET_KEY = "access-secret";

const env = {
  JWT_REFRESH_SECRET_KEY: "refresh-secret",
  JWT_ACCESS_SECRET_KEY: "access-secret",
};

const EXPIRATION = {
  JWT_ACCESS_SESSION_TOKEN: "10m",
  JWT_REFRESH_SESSION_TOKEN: "7d",
  JWT_REFRESH_REMEMBER_OFF_SESSION_TOKEN: "1d",
};

describe("refreshTokenService", () => {
  const mockUser = {
    userID: "user123",
    email: "user@test.com",
    userFirstName: "John",
    userLastName: "Doe",
  };

  const mockSession = {
    userSessionID: "session123",
    refreshTokenHash: "hashedToken",
    rememberMe: true,
    user: mockUser,
  };

  const validInput = {
    refreshSessionToken: "refresh.jwt.token",
    userID: "user123",
    userSessionID: "session123",
    userIPAddress: "127.0.0.1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockReset();
    (jwt.sign as jest.Mock).mockReset();
    (argon2.verify as jest.Mock).mockReset();
    (argon2.hash as jest.Mock).mockReset();
    (prisma.userSession.findFirst as jest.Mock).mockReset();
    (prisma.userSession.update as jest.Mock).mockReset();
  });

  // --------------------------------------------------
  it("throws 500 if env keys missing", async () => {
    const oldRefresh = env.JWT_REFRESH_SECRET_KEY;
    (env as any).JWT_REFRESH_SECRET_KEY = "";

    await expect(refreshTokenService(validInput)).rejects.toBeInstanceOf(ServiceException);

    (env as any).JWT_REFRESH_SECRET_KEY = oldRefresh;
  });

  // --------------------------------------------------
  it("throws 401 if refresh token payload invalid", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({}); // missing sub + sessionId

    await expect(refreshTokenService(validInput)).rejects.toBeInstanceOf(ServiceException);
  });

  // --------------------------------------------------
  it("throws 404 if session not found", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({
      sub: "user123",
      userSessionID: "session123",
    });

    (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(refreshTokenService(validInput)).rejects.toBeInstanceOf(ServiceException);
  });

  // --------------------------------------------------
  it("throws 401 if token hash does not match", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({
      sub: "user123",
      userSessionID: "session123",
    });

    (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(mockSession);

    (argon2.verify as jest.Mock).mockResolvedValue(false);

    await expect(refreshTokenService(validInput)).rejects.toBeInstanceOf(ServiceException);

    expect(prisma.userSession.update).toHaveBeenCalled();
  });

  // --------------------------------------------------
  it("returns success + rotates tokens when valid", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({
      sub: "user123",
      userSessionID: "session123",
    });

    (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(mockSession);

    (argon2.verify as jest.Mock).mockResolvedValue(true);

    (jwt.sign as jest.Mock)
      .mockReturnValueOnce("newAccessToken")
      .mockReturnValueOnce("newRefreshToken");

    (argon2.hash as jest.Mock).mockResolvedValue("hashedNewRefresh");

    interface RefreshTokenResult {
      newAccessToken: string;
      newRefreshToken: string;
      user: {
        userID: string;
        email: string;
        userFirstName: string;
        userLastName: string;
      };
    }

    const result = await refreshTokenService<RefreshTokenResult>(validInput);

    expect(result.success).toBe(true);
    expect(result.data?.newAccessToken).toBe("newAccessToken");
    expect(result.data?.newRefreshToken).toBe("newRefreshToken");

    expect(prisma.userSession.update).toHaveBeenCalled();
  });

  // --------------------------------------------------
  it("wraps unexpected errors into ServiceException(500)", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("boom");
    });

    await expect(refreshTokenService(validInput)).rejects.toBeInstanceOf(ServiceException);
  });
});
