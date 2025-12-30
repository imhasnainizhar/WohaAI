import { signupInitService } from "@services/signup/get_started";
import { prisma } from "../../../src/clients/prisma";
import { setCache } from "@utils/redis";
import { createJwtToken } from "@utils/jwt";
import { randomUUID } from "crypto";
import { env, EXPIRATION } from "@config/env";
import { ServiceException } from "../../../src/utils/response";

jest.mock("@utils/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));
jest.mock("@utils/redis", () => ({
    setCache: jest.fn(),
    getCache: jest.fn(),
}));
jest.mock("@utils/jwt");
jest.mock("crypto");
jest.mock("@utils/logger", () => ({
    logger: {
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
        info: jest.fn(),
    },
}));

const mockPrismaFind = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockSetCache = setCache as jest.MockedFunction<typeof setCache>;
const mockCreateJwtToken = createJwtToken as jest.MockedFunction<typeof createJwtToken>;
const mockRandomUUID = randomUUID as jest.MockedFunction<typeof randomUUID>;

describe("signupInitService", () => {
    afterEach(() => jest.clearAllMocks());

    it("should successfully initialize signup session for valid username", async () => {
        const username = "newuser";

        mockCreateJwtToken.mockImplementation(() => "mocked-jwt-token");
        mockSetCache.mockResolvedValue(true);
        mockPrismaFind.mockResolvedValue(null);
        mockRandomUUID.mockImplementation(() => "session-id-123-jj-jg");

        const result = await signupInitService(username);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.cookies).toBeDefined();
        expect(mockPrismaFind).toHaveBeenCalledWith({ where: { username } });
        expect(mockSetCache).toHaveBeenCalledWith(
            `pending_signup:session-id-123-jj-jg`,
            JSON.stringify({ username }),
            EXPIRATION.REDIS_SIGNUP_SESSION_TTL
        );
        expect(mockCreateJwtToken).toHaveBeenCalledWith(
            { signupSessionID: "session-id-123-jj-jg" },
            env.JWT_SIGNUP_SESSION_SECRET_KEY,
            { expiresIn: Number(EXPIRATION.JWT_SIGNUP_SESSION_TOKEN) }
        );
    });

    it("should throw ServiceException for invalid username", async () => {
        const invalidUsername = "x"; // assume schema requires min length > 1

        await expect(signupInitService(invalidUsername)).rejects.toThrow(ServiceException);

        expect(mockPrismaFind).not.toHaveBeenCalled();
        expect(mockSetCache).not.toHaveBeenCalled();
    });

    it("should throw ServiceException if username is already taken", async () => {
        const username = "takenuser";

        mockPrismaFind.mockResolvedValue({ username } as any);

        await expect(signupInitService(username)).rejects.toThrow(ServiceException);

        expect(mockPrismaFind).toHaveBeenCalledWith({ where: { username } });
        expect(mockSetCache).not.toHaveBeenCalled();
    });

    it("should throw ServiceException on unexpected internal errors", async () => {
        const username = "validuser";

        // Simulate unexpected error in Prisma
        mockPrismaFind.mockRejectedValue(new Error("DB down"));

        await expect(signupInitService(username)).rejects.toThrow(ServiceException);

        expect(mockPrismaFind).toHaveBeenCalled();
        expect(mockSetCache).not.toHaveBeenCalled();
    });
});
