import { generateVerificationCodeService } from "@services/verifications/generate_code";
import { setCache, getCache } from "@utils/redis_client";

// Mock dependencies
jest.mock("@utils/redis_client", () => ({
    setCache: jest.fn(),
    getCache: jest.fn(),
}));

jest.mock('@utils/logger', () => ({
    logger: {
        debug: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn()
    }
}));

jest.mock("@config/env", () => ({
    EXPIRATION: {
        REDIS_SIGNUP_SESSION_TTL: 3600,
    },
}));

describe("generateVerificationCodeService", () => {
    const mockSessionID = "session_123";
    const mockPendingUser = {
        email: "test@example.com",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should generate and store verification code", async () => {
        (getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockPendingUser));
        (setCache as jest.Mock).mockResolvedValue("OK");

        const result = await generateVerificationCodeService(mockSessionID);

        expect(result.success).toBe(true);
        expect(result?.data?.code).toBeDefined();
        expect(setCache).toHaveBeenCalledWith(
            `verification_code:${mockSessionID}`,
            expect.any(String),
            3600
        );
    });

    it("should return 400 if session ID is missing", async () => {
        const result = await generateVerificationCodeService("");

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(result.errorType).toBe("session_expired");
    });

    it("should throw 400 if session expired (not found in Redis)", async () => {
        (getCache as jest.Mock).mockResolvedValue(null);

        await expect(generateVerificationCodeService(mockSessionID)).rejects.toMatchObject({
            response: { statusCode: 400, errorType: "session_expired" },
        });
    });

    it("should throw 500 if Redis fails to store code", async () => {
        (getCache as jest.Mock).mockResolvedValue(JSON.stringify(mockPendingUser));
        (setCache as jest.Mock).mockResolvedValue(null);

        await expect(generateVerificationCodeService(mockSessionID)).rejects.toMatchObject({
            response: { statusCode: 500, errorType: "internal_server_error" },
        });
    });

    it("should throw 500 for unexpected errors", async () => {
        (getCache as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        await expect(generateVerificationCodeService(mockSessionID)).rejects.toMatchObject({
            response: { statusCode: 500, errorType: "internal_server_error" },
        });
    });
});
