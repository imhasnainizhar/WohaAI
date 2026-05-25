import continueWithEmailService from "@services/signup/continue/with_email";
import { getSignupCache, setSignupCache } from "../../../../src/helpers/redis";
import { prisma } from "@clients/prisma";
import { ServiceException } from "../../../../src/helpers/response";
import { ContinueWithEmailDTO } from "../../../../../../packages/api/src/auth";

// Mock Redis and Prisma dependencies
jest.mock("@utils/redis");
jest.mock("@clients/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
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

describe("continueWithEmailService", () => {
    // Setup typed mocks for clean assertions
    const mockedGetSignupCache = jest.mocked(getSignupCache);
    const mockedSetSignupCache = jest.mocked(setSignupCache);
    const mockedFindUser = jest.mocked(prisma.user.findUnique);

    const signupSessionID = "abc123";
    const email = "test@example.com";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("throws validation error when signup session missing", async () => {
        // Scenario: The session ID provided does not exist in the cache (expired or invalid)
        mockedGetSignupCache.mockResolvedValueOnce(null);

        await expect(
            continueWithEmailService({ signupSessionID, email })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("throws validation error when email format is invalid", async () => {
        // Scenario: Session exists, but the user provided an incorrectly formatted email
        mockedGetSignupCache.mockResolvedValueOnce({});

        await expect(
            continueWithEmailService({ signupSessionID, email: "bad" })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("throws conflict when email already exists", async () => {
        // Security/Business Logic: Ensure email uniqueness in the database
        mockedGetSignupCache.mockResolvedValueOnce({});
        mockedFindUser.mockResolvedValueOnce({ id: "user1" } as any);

        await expect(
            continueWithEmailService({ signupSessionID, email })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("caches email and returns success when valid", async () => {
        // Happy Path: Session is valid, email is unique, and cache is updated
        mockedGetSignupCache.mockResolvedValueOnce(JSON.stringify({ username: "hani" }));
        mockedFindUser.mockResolvedValueOnce(null);
        mockedSetSignupCache.mockResolvedValueOnce(true as any);

        const res = await continueWithEmailService({ signupSessionID, email });

        expect(res.success).toBe(true);
        expect(res.statusCode).toBe(200);

        // Verify: The new email is merged into the existing session data in Redis
        expect(mockedSetSignupCache).toHaveBeenCalledWith(
            signupSessionID,
            JSON.stringify({ username: "hani", email })
        );
    });

    test("wraps unexpected errors into ServiceException", async () => {
        // Resilience: Catch and wrap infrastructure failures (like Redis connectivity issues)
        mockedGetSignupCache.mockRejectedValueOnce(new Error("redis down"));

        await expect(
            continueWithEmailService({ signupSessionID, email })
        ).rejects.toBeInstanceOf(ServiceException);
    });
});