import { createUserService } from "../../src/services/createuser";
import { prisma } from "../../src/utils/prisma_client";
import { getCache, deleteCache } from "../../src/utils/redis_client";
import { ServiceException, ServiceResponse } from "../../src/utils/response";
import { logger } from "../../src/utils/logger";

// Mock Logger
jest.mock("@utils/logger", () => ({
    logger: {
        debug: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn()
    }
}))

// Mocking Prisma
jest.mock('@utils/prisma_client', () => ({
    prisma: {
        user: {
            create: jest.fn(),
        },
    },
}));

// Mocking Redis Caching
jest.mock('@utils/redis_client', () => ({
    getCache: jest.fn(),
    deleteCache: jest.fn(),
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedGetCache = getCache as jest.MockedFunction<typeof getCache>;
const mockedDeleteCache = deleteCache as jest.MockedFunction<typeof deleteCache>;
const mockedLogger = logger as jest.Mocked<typeof logger>;

describe("getUserService", () => {
    const userData = {
        email: 'new@example.com',
        userFirstName: 'New',
        userLastName: 'User',
        username: 'newuser',
        hashedPassword: 'password123',
        signupSessionID: '2843hani_tests'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a user successfully", async () => {
        // Mock Redis returning a valid payload
        mockedGetCache.mockResolvedValue(JSON.stringify({ email: userData.email }));

        // Mock Prisma returning the created user
        const mockUser = {
            userID: "user123",
            email: userData.email,
            username: userData.username,
            userFirstName: userData.userFirstName,
            userLastName: userData.userLastName,
            createdAt: new Date(),
        };
        mockedPrisma.user.create.mockResolvedValue(mockUser as any);

        const result = await createUserService(userData);

        expect(result.success).toBe(true);
        expect(result?.data?.user).toEqual(mockUser);
        expect(mockedGetCache).toHaveBeenCalledWith(`pending_signup:${userData.signupSessionID}`);
        expect(mockedPrisma.user.create).toHaveBeenCalledWith({
            data: {
                email: userData.email,
                hashedPassword: userData.hashedPassword,
                userFirstName: userData.userFirstName,
                userLastName: userData.userLastName,
                username: userData.username,
            },
            select: {
                userID: true,
                email: true,
                username: true,
                userFirstName: true,
                userLastName: true,
                createdAt: true,
            },
        });
        expect(mockedDeleteCache).toHaveBeenCalledWith(`pending_signup:${userData.signupSessionID}`);
        expect(mockedLogger.info).toHaveBeenCalledWith(expect.stringContaining("User created successfully"));
    });

    it("should throw unauthorized error if Redis payload is missing", async () => {
        mockedGetCache.mockResolvedValue(null);

        await expect(createUserService(userData)).rejects.toThrow(ServiceException);
        await expect(createUserService(userData)).rejects.toMatchObject({
            response: expect.objectContaining({ statusCode: 401 }),
        });
        expect(mockedPrisma.user.create).not.toHaveBeenCalled();
        expect(mockedDeleteCache).not.toHaveBeenCalled();
    });

    it("should throw data tampered error if email mismatch", async () => {
        mockedGetCache.mockResolvedValue(JSON.stringify({ email: "wrong@example.com" }));

        await expect(createUserService(userData)).rejects.toThrow(ServiceException);
        await expect(createUserService(userData)).rejects.toMatchObject({
            response: expect.objectContaining({ statusCode: 403 }),
        });
        expect(mockedPrisma.user.create).not.toHaveBeenCalled();
        expect(mockedDeleteCache).not.toHaveBeenCalled();
    });

    it("should throw internal server error if Prisma fails", async () => {
        mockedGetCache.mockResolvedValue(JSON.stringify({ email: userData.email }));
        mockedPrisma.user.create.mockRejectedValue(new Error("DB down"));

        await expect(createUserService(userData)).rejects.toThrow(ServiceException);
        await expect(createUserService(userData)).rejects.toMatchObject({
            response: expect.objectContaining({ statusCode: 500 }),
        });

        expect(mockedDeleteCache).not.toHaveBeenCalled();
    });

    it("should log errors correctly", async () => {
        mockedGetCache.mockRejectedValue(new Error("Redis down"));

        await expect(createUserService(userData)).rejects.toThrow(ServiceException);
        expect(mockedLogger.error).toHaveBeenCalledWith(
            "❌ createUserService error:",
            expect.any(Error)
        );
    });
});
