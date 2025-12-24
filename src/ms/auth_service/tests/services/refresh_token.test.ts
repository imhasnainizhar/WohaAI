import { refreshTokenService } from "@services/refresh_token";
import { prisma } from "@utils/prisma_client";
import { ServiceException } from "@utils/response";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { env } from "@config/env";

// Mock dependencies
jest.mock("@utils/prisma_client", () => ({
    prisma: {
        userSession: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock("jsonwebtoken");
jest.mock("argon2");
jest.mock("@utils/logger");
jest.mock("@config/env.config", () => ({
    env: {
        JWT_REFRESH_SECRET_KEY: "refresh_secret",
        JWT_ACCESS_SECRET_KEY: "access_secret",
    },
    EXPIRATION: {
        JWT_ACCESS_SESSION_TOKEN: "15m",
        JWT_REFRESH_SESSION_TOKEN: "7d",
        JWT_REFRESH_REMEMBER_OFF_SESSION_TOKEN: "1d",
    },
}));

describe("refreshTokenService", () => {
    const mockInput = {
        refreshSessionToken: "valid_refresh_token",
        userID: "user_123",
        userSessionID: "session_123",
        userIPAddress: "127.0.0.1",
        rememberMe: true,
    };

    const mockUser = {
        userID: "user_123",
        email: "test@example.com",
        userFirstName: "John",
        userLastName: "Doe",
    };

    const mockSession = {
        refreshTokenHash: "hashed_token",
        userSessionID: "session_123",
        user: mockUser,
        rememberMe: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should refresh tokens successfully", async () => {
        (jwt.verify as jest.Mock).mockReturnValue({
            sub: "user_123",
            userSessionID: "session_123",
        });
        (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(mockSession);
        (argon2.verify as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock)
            .mockReturnValueOnce("new_access_token") // Access token
            .mockReturnValueOnce("new_refresh_token"); // Refresh token
        (argon2.hash as jest.Mock).mockResolvedValue("new_hashed_token");
        (prisma.userSession.update as jest.Mock).mockResolvedValue({});

        const result = await refreshTokenService(mockInput);

        expect(result.success).toBe(true);
        expect(result?.data?.newAccessToken).toBe("new_access_token");
        expect(result?.data?.newRefreshToken).toBe("new_refresh_token");
        expect(prisma.userSession.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { userSessionID: "session_123" },
            data: expect.objectContaining({ refreshTokenHash: "new_hashed_token" }),
        }));
    });

    it("should throw 500 if JWT keys are missing", async () => {
        // Save original env
        const originalEnv = { ...env };
        // @ts-ignore
        env.JWT_REFRESH_SECRET_KEY = undefined;

        await expect(refreshTokenService(mockInput)).rejects.toMatchObject({
            response: { statusCode: 500, errorType: "token_error" },
        });

        // Restore env
        Object.assign(env, originalEnv);
    });

    it("should throw 401 if refresh token payload is invalid", async () => {
        (jwt.verify as jest.Mock).mockReturnValue({}); // Missing sub/userSessionID

        await expect(refreshTokenService(mockInput)).rejects.toMatchObject({
            response: { statusCode: 401, errorType: "invalid_token" },
        });
    });

    it("should throw 404 if user session not found", async () => {
        (jwt.verify as jest.Mock).mockReturnValue({
            sub: "user_123",
            userSessionID: "session_123",
        });
        (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(refreshTokenService(mockInput)).rejects.toMatchObject({
            response: { statusCode: 404, errorType: "user_not_found" },
        });
    });

    it("should throw 401 and revoke session if hash mismatch", async () => {
        (jwt.verify as jest.Mock).mockReturnValue({
            sub: "user_123",
            userSessionID: "session_123",
        });
        (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(mockSession);
        (argon2.verify as jest.Mock).mockResolvedValue(false); // Mismatch

        await expect(refreshTokenService(mockInput)).rejects.toMatchObject({
            response: { statusCode: 401, errorType: "session_expired" },
        });

        expect(prisma.userSession.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { userSessionID: "session_123" },
            data: expect.objectContaining({ revoked: true }),
        }));
    });

    it("should throw 500 for unexpected errors", async () => {
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        await expect(refreshTokenService(mockInput)).rejects.toMatchObject({
            response: { statusCode: 500, errorType: "internal_server_error" },
        });
    });
});
