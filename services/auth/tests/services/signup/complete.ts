import { completeSignupService } from "@services/signup/complete";
import { getSignupCache, setSignupCache } from "../../../src/internals/utils/redis";
import { internalError } from "@internals/errors/auth";
import { ServiceException } from "../../../src/internals/utils/response";

// Mock Redis utilities for session persistence
jest.mock("@utils/redis", () => ({
    getSignupCache: jest.fn(),
    setSignupCache: jest.fn(),
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

// Mock custom error handlers and ensure they throw or return as expected
jest.mock("@errors/auth", () => ({
    throwSessionExpired: jest.fn(() => {
        throw new (class extends Error { })();
    }),
    internalError: jest.fn((err) => err),
}));

describe("completeSignupService", () => {
    // Mock input and existing state
    const dto = {
        signupSessionID: "session-123",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("2000-01-01"),
        password: "pass123",
    };

    const existingSession = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("2000-01-01"),
        password: "pass123",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ---------- SUCCESS (no change) ----------
    test("returns success and does NOT update Redis when data is unchanged", async () => {
        // Setup: Cache already contains the exact data being submitted
        (getSignupCache as jest.Mock).mockResolvedValue(existingSession);

        const res = await completeSignupService(dto);

        // Verify: Success returned, but redundant network call to Redis skipped
        expect(res.success).toBe(true);
        expect(setSignupCache).not.toHaveBeenCalled();
    });

    // ---------- SUCCESS + UPDATE ----------
    test("updates Redis when data has changed", async () => {
        // Setup: Cache contains different data than the current submission
        (getSignupCache as jest.Mock).mockResolvedValue({
            firstName: "Old",
            lastName: "Name",
            password: "old123",
        });

        await completeSignupService(dto);

        // Verify: Cache is updated with the new profile details
        expect(setSignupCache).toHaveBeenCalledWith(
            "session-123",
            expect.objectContaining({
                firstName: "John",
                lastName: "Doe",
                password: "pass123",
            }),
        );
    });

    // ---------- ERROR WRAP ----------
    test("wraps unexpected errors via internalError", async () => {
        // Scenario: Connection failure to the cache layer
        (getSignupCache as jest.Mock).mockImplementation(() => {
            throw new Error("redis down");
        });

        await expect(completeSignupService(dto)).rejects.toBeTruthy();
        // Verify the error was processed through the standard error formatter
        expect(internalError).toHaveBeenCalled();
    });
});