import { signinService } from "@services/signin";
import { prisma } from "../../src/clients/prisma";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { createUserSession } from "@utils/create_user_session";
import { env } from "@config/env";

// Mock dependencies
jest.mock("@utils/logger", () => ({
    logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
    }
}));

jest.mock("@utils/prisma", () => ({
    prisma: {
        user: {
            findFirst: jest.fn(),
        }
    }
}))

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
}));

jest.mock("argon2", () => ({
    verify: jest.fn(),
}));

jest.mock("@utils/create_user_session", () => ({
    createUserSession: jest.fn(),
}));


describe("signinService", () => {
    const mockInput = {
        username: "johndoe",
        password: "password123",
    };

    const mockClientData = {
        userDeviceName: "Chrome",
        userDeviceType: "Desktop",
        userDeviceID: "device_123",
        userDeviceBrowser: "Chrome",
        userDeviceOS: "Windows",
        userIPAddress: "127.0.0.1",
    };

    const mockUser = {
        userID: "user_123",
        userFirstName: "John",
        userLastName: "Doe",
        email: "test@example.com",
        username: "johndoe",
        hashedPassword: "hashed_password",
    };

    const mockSession = {
        userSessionID: "session_123",
        userIPAddress: "127.0.0.1",
        userDeviceName: "Chrome",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should sign in user successfully", async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (argon2.verify as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue("mock_token");
        (createUserSession as jest.Mock).mockResolvedValue(mockSession);

        const result = await signinService(mockInput, mockClientData);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.cookies).toHaveLength(2);
        expect(createUserSession).toHaveBeenCalled();
    });

    it("should throw 400 if input is invalid", async () => {
        const invalidInput = { ...mockInput, password: "short" }; // Too short password

        await expect(signinService(invalidInput, mockClientData)).rejects.toMatchObject({
            response: { statusCode: 400, errorType: "validation_error" },
        });
    });

    it("should throw 400 if neither email nor username is provided", async () => {
        const invalidInput = { password: "password123" };

        // @ts-ignore
        await expect(signinService(invalidInput, mockClientData)).rejects.toMatchObject({
            response: { statusCode: 400, errorType: "missing_credentials" },
        });
    });

    it("should throw 401 if user not found", async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(signinService(mockInput, mockClientData)).rejects.toMatchObject({
            response: { statusCode: 401, errorType: "user_not_found" },
        });
    });

    it("should throw 401 if password is incorrect", async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (argon2.verify as jest.Mock).mockResolvedValue(false);

        await expect(signinService(mockInput, mockClientData)).rejects.toMatchObject({
            response: { statusCode: 401, errorType: "wrong_password" },
        });
    });

    it("should throw 500 if JWT keys are missing", async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (argon2.verify as jest.Mock).mockResolvedValue(true);

        const originalEnv = { ...env };
        // @ts-ignore
        env.JWT_ACCESS_SECRET_KEY = undefined;

        await expect(signinService(mockInput, mockClientData)).rejects.toMatchObject({
            response: { statusCode: 500, errorType: "token_error" },
        });

        Object.assign(env, originalEnv);
    });

    it("should throw 500 for unexpected errors", async () => {
        (prisma.user.findFirst as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        await expect(signinService(mockInput, mockClientData)).rejects.toMatchObject({
            response: { statusCode: 500, errorType: "internal_server_error" },
        });
    });
});
