import { signinService } from "@services/signin";
import { prisma } from "@clients/prisma";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { ServiceException } from "../../src/internals/utils/response";
import { createUserSession } from "../../src/internals/utils/create_user_session";
import { env, EXPIRATION } from "@config/env";

// Mock external dependencies (DB, crypto, tokens, logging)
jest.mock("@clients/prisma", () => ({
    prisma: {
        user: {
            findFirst: jest.fn(),
        },
    },
}));

jest.mock("@utils/create_user_session", () => ({
    createUserSession: jest.fn(),
}));

jest.mock("argon2", () => ({
    verify: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
}));

jest.mock("@utils/logger", () => ({
    logger: {
        debug: jest.fn(),
        fatal: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
    },
}));

// Force stable environment variables for deterministic testing
(env as any).JWT_ACCESS_SECRET_KEY = "ACCESS_KEY";
(env as any).JWT_REFRESH_SECRET_KEY = "REFRESH_KEY";
(env as any).ACCESS_TOKEN_NAME = "access";
(env as any).REFRESH_TOKEN_NAME = "refresh";
(env as any).SAME_SITE_COOKIE_OPTION = "lax";
(env as any).SECURE_COOKIE_OPTION = false;

(EXPIRATION as any).JWT_ACCESS_SESSION_TOKEN = "15m";
(EXPIRATION as any).JWT_REFRESH_SESSION_TOKEN = "7d";
(EXPIRATION as any).ACCESS_SESSION_COOKIE = 900;
(EXPIRATION as any).REFRESH_SESSION_COOKIE = 604800;

// Reusable fixtures
const mockUser = {
    userID: "u1",
    userFirstName: "John",
    userLastName: "Doe",
    email: "john@test.com",
    username: "johnny",
    hashedPassword: "hashed",
};

const mockSession = {
    userSessionID: "sess-1",
    userIPAddress: "127.0.0.1",
    userDeviceName: "Chrome",
};

const clientData = {
    userDeviceName: "Chrome",
    userDeviceType: "Desktop",
    userDeviceID: "device-abc",
    userDeviceBrowser: "Chrome",
    userDeviceOS: "Windows",
    userIPAddress: "127.0.0.1",
}

describe("signinService", () => {
    // Clear mock history before every test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("authenticates successfully and returns cookies + user", async () => {
        // Setup: Valid user, correct password, successful session creation
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (argon2.verify as jest.Mock).mockResolvedValue(true);
        (createUserSession as jest.Mock).mockResolvedValue(mockSession);

        // Mock JWT generation sequence
        (jwt.sign as jest.Mock)
            .mockReturnValueOnce("refreshToken-1") // first refresh
            .mockReturnValueOnce("refreshToken-2") // final refresh
            .mockReturnValueOnce("accessToken-1"); // access

        const dto = {
            usernameOrEmail: { type: "email" as const, value: "johnny" },
            password: "123htg6t6",
            clientData: clientData,
        };

        const res = await signinService<{
            user: {
                userID: string;
                firstName: string;
                lastName: string;
                email: string;
            }
        }>(dto);

        // Verify: Success status, cookies set, and user data returned
        expect(res.success).toBe(true);
        expect(res.statusCode).toBe(200);
        expect(res.cookies).toHaveLength(2);
        expect(res.data?.user).toEqual({
            userID: mockUser.userID,
            firstName: mockUser.userFirstName,
            lastName: mockUser.userLastName,
            email: mockUser.email,
        });
    });

    test("throws when no username/email provided", async () => {
        // Validation: Ensure input is present
        await expect(
            signinService({
                usernameOrEmail: { type: "email" as const, value: "" },
                password: "123",
                clientData: clientData
            })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("throws when user not found", async () => {
        // Scenario: User does not exist in DB
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(
            signinService({
                usernameOrEmail: { type: "email", value: "nope" },
                password: "123",
                clientData: clientData
            })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("throws when password incorrect", async () => {
        // Scenario: User exists, but hash verification fails
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (argon2.verify as jest.Mock).mockResolvedValue(false);

        await expect(
            signinService({
                usernameOrEmail: { type: "email", value: "johnny" },
                password: "wrong",
                clientData: clientData
            })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("throws when JWT keys missing", async () => {
        // Edge Case: Critical configuration is missing
        (env as any).JWT_ACCESS_SECRET_KEY = undefined;

        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (argon2.verify as jest.Mock).mockResolvedValue(true);

        await expect(
            signinService({
                usernameOrEmail: { type: "email", value: "johnny" },
                password: "123",
                clientData: clientData
            })
        ).rejects.toBeInstanceOf(ServiceException);

        // Restore key for subsequent tests
        (env as any).JWT_ACCESS_SECRET_KEY = "ACCESS_KEY";
    });

    test("throws when DB lookup fails", async () => {
        // Infrastructure failure: DB read error
        (prisma.user.findFirst as jest.Mock).mockRejectedValue(
            new Error("DB down")
        );

        await expect(
            signinService({
                usernameOrEmail: { type: "email", value: "johnny" },
                password: "123",
                clientData: clientData
            })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("throws if session cannot be created", async () => {
        // Dependency failure: User/Pass valid, but session utility fails
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (argon2.verify as jest.Mock).mockResolvedValue(true);

        (createUserSession as jest.Mock).mockRejectedValue(
            new Error("session failed")
        );

        await expect(
            signinService({
                usernameOrEmail: { type: "email", value: "johnny" },
                password: "123",
                clientData: clientData
            })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("wraps unknown runtime errors", async () => {
        // Catch-all: Unexpected runtime exceptions
        (prisma.user.findFirst as jest.Mock).mockImplementation(() => {
            throw new Error("boom");
        });

        await expect(
            signinService({
                usernameOrEmail: { value: "johnny" },
            } as any)
        ).rejects.toBeInstanceOf(ServiceException);
    });
});