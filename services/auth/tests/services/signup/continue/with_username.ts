import continueWithUsernameService from "@services/signup/continue/with_username";
import { getSignupCache, setSignupCache } from "../../../../src/internals/utils/redis";
import { prisma } from "@clients/prisma";
import { ServiceException } from "../../../../src/internals/utils/response";

// Mock infrastructure dependencies
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

describe("continueWithUsernameService", () => {
    // Use typed mocks for better assertion clarity
    const mockedGetSignupCache = jest.mocked(getSignupCache);
    const mockedSetSignupCache = jest.mocked(setSignupCache);
    const mockedFindUser = jest.mocked(prisma.user.findUnique);

    const signupSessionID = "abc123";
    const username = "hani_dev";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("throws validation error when signup session missing", async () => {
        // Scenario: User attempts to set a username but the session has expired or is invalid
        mockedGetSignupCache.mockResolvedValueOnce(null);

        await expect(
            continueWithUsernameService({ signupSessionID, username })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("throws conflict when username already exists", async () => {
        // Business Logic: Prevent duplicate usernames in the database
        mockedGetSignupCache.mockResolvedValueOnce({});
        mockedFindUser.mockResolvedValueOnce({ id: "user1" } as any);

        await expect(
            continueWithUsernameService({ signupSessionID, username })
        ).rejects.toBeInstanceOf(ServiceException);
    });

    test("caches username and returns success when valid", async () => {
        // Happy Path: Session exists, username is unique, and cache is successfully updated
        mockedGetSignupCache.mockResolvedValueOnce(JSON.stringify({ step: "email" }));
        mockedFindUser.mockResolvedValueOnce(null);
        mockedSetSignupCache.mockResolvedValueOnce(true as any);

        const res = await continueWithUsernameService({ signupSessionID, username });

        expect(res.success).toBe(true);
        expect(res.statusCode).toBe(200);

        // Verify: The username is correctly merged into the existing session data
        expect(mockedSetSignupCache).toHaveBeenCalledWith(
            signupSessionID,
            JSON.stringify({ step: "email", username })
        );
    });

    test("wraps unexpected errors into ServiceException", async () => {
        // Resilience: Catch and wrap database or network level exceptions
        mockedGetSignupCache.mockRejectedValueOnce(new Error("redis down"));

        await expect(
            continueWithUsernameService({ signupSessionID, username })
        ).rejects.toBeInstanceOf(ServiceException);
    });
});