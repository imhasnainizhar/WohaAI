import {
    validateDisplayNameService,
    validateEmailService,
    confirmUserEmailService,
    validatePasswordService,
} from "@services/signup/signup";
import { prisma } from "@utils/prisma_client";
import { getCache, setCache, deleteCache } from "@utils/redis_client";
import { createJwtToken } from "@utils/jwt";

// Mock dependencies
jest.mock("@utils/prisma_client", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock("@utils/redis_client", () => ({
    getCache: jest.fn(),
    setCache: jest.fn(),
    deleteCache: jest.fn(),
}));

jest.mock("@utils/jwt", () => ({
    createJwtToken: jest.fn(),
}));

jest.mock("@utils/logger");
jest.mock("@config/env.config", () => ({
    env: {
        JWT_SIGNUP_SESSION_SECRET_KEY: "signup_secret",
        SECURE_COOKIE_OPTION: false,
        SAME_SITE_COOKIE_OPTION: "lax",
        SIGNUP_SESSION_TOKEN_NAME: "signup_token",
    },
    EXPIRATION: {
        REDIS_SIGNUP_SESSION_TTL: 3600,
        REDIS_SIGNUP_SESSION_TTL_EXTENDED: 7200,
        JWT_SIGNUP_SESSION_TOKEN_EXTENDED: 7200,
        SIGNUP_SESSION_COOKIE_EXTENDED: 7200000,
    },
}));

describe("Signup Services", () => {
    const mockSessionID = "session_123";
    const mockPendingData = {
        username: "johndoe",
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("validateDisplayNameService", () => {
        it("should validate and cache display name", async () => {
            (getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockPendingData));
            (setCache as jest.Mock).mockResolvedValue("OK");

            const result = await validateDisplayNameService(
                mockSessionID,
                "johndoe",
                "John",
                "Doe"
            );

            expect(result.success).toBe(true);
            expect(setCache).toHaveBeenCalled();
        });

        it("should throw 409 if username mismatch", async () => {
            (getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockPendingData));

            await expect(
                validateDisplayNameService(mockSessionID, "wrong_user", "John", "Doe")
            ).rejects.toMatchObject({
                response: { statusCode: 409, errorType: "signup_state_conflict" },
            });
        });

        it("should throw 400 if validation fails", async () => {
            (getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockPendingData));

            await expect(
                validateDisplayNameService(mockSessionID, "johndoe", "", "")
            ).rejects.toMatchObject({
                response: { statusCode: 400, errorType: "validation_error" },
            });
        });
    });

    describe("validateEmailService", () => {
        it("should validate and cache email", async () => {
            (getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockPendingData));
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (setCache as jest.Mock).mockResolvedValue("OK");

            const result = await validateEmailService(
                mockSessionID,
                "johndoe",
                "test@example.com",
                "John",
                "Doe"
            );

            expect(result.success).toBe(true);
            expect(setCache).toHaveBeenCalled();
        });

        it("should throw 409 if email already exists", async () => {
            (getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockPendingData));
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "existing" });

            await expect(
                validateEmailService(
                    mockSessionID,
                    "johndoe",
                    "test@example.com",
                    "John",
                    "Doe"
                )
            ).rejects.toMatchObject({
                response: { statusCode: 409, errorType: "conflict_error" },
            });
        });
    });

    describe("confirmUserEmailService", () => {
        it("should confirm email and return token", async () => {
            (getCache as jest.Mock)
                .mockResolvedValueOnce(JSON.stringify(mockPendingData)) // pending user
                .mockResolvedValueOnce("123456"); // verification code
            (deleteCache as jest.Mock).mockResolvedValue(1);
            (createJwtToken as jest.Mock).mockReturnValue("new_token");
            (setCache as jest.Mock).mockResolvedValue("OK");

            const result = await confirmUserEmailService(
                "123456",
                mockSessionID,
                "test@example.com"
            );

            expect(result.success).toBe(true);
            expect(result.data.validationToken).toBe("new_token");
            expect(deleteCache).toHaveBeenCalled();
        });

        it("should throw 400 if code format is invalid", async () => {
            await expect(
                confirmUserEmailService("abc", mockSessionID, "test@example.com")
            ).rejects.toMatchObject({
                response: { statusCode: 400, errorType: "validation_error" },
            });
        });

        it("should throw 410 if code expired", async () => {
            (getCache as jest.Mock)
                .mockResolvedValueOnce(JSON.stringify(mockPendingData))
                .mockResolvedValueOnce(null);

            await expect(
                confirmUserEmailService("123456", mockSessionID, "test@example.com")
            ).rejects.toMatchObject({
                response: { statusCode: 410, errorType: "code_expired" },
            });
        });

        it("should throw 401 if code mismatch", async () => {
            (getCache as jest.Mock)
                .mockResolvedValueOnce(JSON.stringify(mockPendingData))
                .mockResolvedValueOnce("654321");

            await expect(
                confirmUserEmailService("123456", mockSessionID, "test@example.com")
            ).rejects.toMatchObject({
                response: { statusCode: 401, errorType: "invalid_code" },
            });
        });
    });

    describe("validatePasswordService", () => {
        it("should validate and cache password", async () => {
            (getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockPendingData));
            (setCache as jest.Mock).mockResolvedValue("OK");

            const result = await validatePasswordService(
                mockSessionID,
                "johndoe",
                "test@example.com",
                "Password123!",
                "Password123!",
                "John",
                "Doe"
            );

            expect(result.success).toBe(true);
            expect(setCache).toHaveBeenCalled();
        });

        it("should throw 400 if passwords do not match", async () => {
            (getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockPendingData));

            await expect(
                validatePasswordService(
                    mockSessionID,
                    "johndoe",
                    "test@example.com",
                    "Password123!",
                    "Mismatch123!",
                    "John",
                    "Doe"
                )
            ).rejects.toMatchObject({
                response: { statusCode: 400, errorType: "validation_error" },
            });
        });
    });
});
