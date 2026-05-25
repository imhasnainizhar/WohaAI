import { refreshTokenService } from "@services/refresh/refresh_session";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@clients/prisma";
import { ServiceException } from "../../../src/helpers/response";
import { env } from "@config/env";

// Mock crypto, database, and token utilities
jest.mock("argon2");
jest.mock("@clients/prisma", () => ({
  prisma: {
    userSession: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@utils/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    fatal: jest.fn(),
  },
}));

jest.mock("jsonwebtoken");

// Force stable environment variables for deterministic testing
(env as any).REFRESH_TOKEN_NAME = "refresh_token";
(env as any).JWT_REFRESH_SECRET_KEY = "refresh-secret";
(env as any).JWT_ACCESS_SECRET_KEY = "access-secret";

describe("refreshTokenService", () => {
  // Setup typed mocks for clean API spying
  const mockedVerify = jest.mocked(jwt.verify);
  const mockedSign = jest.mocked(jwt.sign);
  const mockedArgonVerify = jest.mocked(argon2.verify);
  const mockedArgonHash = jest.mocked(argon2.hash);

  const mockedFindSession = jest.mocked(prisma.userSession.findFirst);
  const mockedUpdateSession = jest.mocked(prisma.userSession.update);

  const cookies = {
    refresh_token: "mock-refresh-token"
  };

  const basePayload = {
    sub: "user123",
    userSessionID: "session123",
  };

  beforeEach(() => {
    jest.resetAllMocks();
    global.crypto = {
      randomUUID: jest.fn().mockReturnValue("mock-jti"),
    } as any;
  });

  test("throws when refresh cookie missing", async () => {
    // Validation: The request must include the specific refresh token cookie
    await expect(
      refreshTokenService({ cookies: {}, userIPAddress: "1.1.1.1" })
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("throws when refresh token expired", async () => {
    // Scenario: The JWT itself has passed its expiration date
    mockedVerify.mockImplementation(() => {
      const e: any = new Error("expired");
      e.name = "TokenExpiredError";
      throw e;
    });

    await expect(
      refreshTokenService({ cookies, userIPAddress: "1.1.1.1" })
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("throws when token invalid", async () => {
    // Security: Token signature is invalid or malformed
    mockedVerify.mockImplementation(() => {
      throw new Error("invalid");
    });

    await expect(
      refreshTokenService({ cookies, userIPAddress: "1.1.1.1" })
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("throws when session not found", async () => {
    // Consistency: Token is valid but the session ID inside doesn't exist in the DB
    mockedVerify.mockReturnValue(basePayload as any);
    mockedFindSession.mockResolvedValueOnce(null);

    await expect(
      refreshTokenService({ cookies, userIPAddress: "1.1.1.1" })
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("revokes session when hash mismatch", async () => {
    mockedVerify.mockReturnValue(basePayload as any);

    mockedFindSession.mockResolvedValueOnce({
      refreshTokenHash: "hash",
      user: {
        userID: "user123",
        email: "hani@example.com",
        userFirstName: "Hani",
        userLastName: "Test",
        username: "hani",
      },
    } as any);
    mockedArgonVerify.mockResolvedValueOnce(false);

    mockedUpdateSession.mockResolvedValueOnce({} as any);

    let caughtError: any = null;

    try {
      await refreshTokenService({ cookies, userIPAddress: "1.1.1.1" });
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(ServiceException);
    expect(mockedUpdateSession).toHaveBeenCalledTimes(1);
    expect(mockedUpdateSession).toHaveBeenCalledWith({
      where: { userSessionID: "session123" },
      data: { revoked: true, revokedAt: expect.any(Date) }
    });
  });


  test("returns new tokens when valid", async () => {
    // Refresh token rotation occurs
    mockedVerify.mockReturnValue(basePayload as any);

    mockedFindSession.mockResolvedValueOnce({
      refreshTokenHash: "hash",
      user: {
        userID: "user123",
        email: "hani@example.com",
        userFirstName: "Hani",
        userLastName: "Test",
        username: "hani",
      },
    } as any);

    mockedArgonVerify.mockResolvedValueOnce(true);
    mockedArgonHash.mockResolvedValueOnce("new-token-hash");

    // Mock generation of the new token pair
    mockedSign.mockReturnValueOnce("new-access-token" as any);
    mockedSign.mockReturnValueOnce("new-refresh-token" as any);

    mockedUpdateSession.mockResolvedValueOnce({} as any);

    const res = await refreshTokenService<{ newRefreshToken: string, newAccessToken: string }>({
      cookies,
      userIPAddress: "127.0.0.1",
    });

    // Verify: User gets a fresh Access and Refresh token
    expect(res.success).toBe(true);
    expect(res.data?.newAccessToken).toBe("new-access-token");
    expect(res.data?.newRefreshToken).toBe("new-refresh-token");
  });

  test("unexpected errors are wrapped", async () => {
    // Resilience: Catch internal processing or network errors
    mockedVerify.mockImplementation(() => {
      throw new Error("boom");
    });

    await expect(
      refreshTokenService({ cookies, userIPAddress: "1.1.1.1" })
    ).rejects.toBeInstanceOf(ServiceException);
  });
});