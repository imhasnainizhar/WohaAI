import { signoutService } from "@services/signout";
import { prisma } from "@clients/prisma";
import { ServiceException } from "../../src/ua/response";

// Mock external dependencies to isolate service logic
jest.mock("@clients/prisma", () => ({
    prisma: {
        userSession: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

// Mock authLogger to suppress console output during tests
jest.mock("@utils/authLogger", () => ({
    authLogger: {
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

// Reusable mock data for positive test cases
const mockSession = {
    userSessionID: "session-123",
    userID: "user-1",
    revoked: false,
    userDeviceName: "Chrome",
    userDeviceID: "device-abc",
    userIPAddress: "127.0.0.1",
};

describe("signoutService", () => {
    const userID = "user-1";
    const sessionID = "session-123";

    // Reset mock call counts/returns before every test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("revokes an active session successfully", async () => {
        // Setup: Simulate finding an active session and a successful update
        (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(mockSession);
        (prisma.userSession.update as jest.Mock).mockResolvedValue({});

        const result = await signoutService(userID, sessionID);

        // Verify successful response structure
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        // expect(result.data?.revokedSession).toEqual({
        //   userSessionID: sessionID,
        //   deviceName: mockSession.userDeviceName,
        //   deviceId: mockSession.userDeviceID,
        //   ipAddress: mockSession.userIPAddress,
        // });

        // Verify DB was queried with correct criteria (active session only)
        expect(prisma.userSession.findFirst).toHaveBeenCalledWith({
            where: { userID, userSessionID: sessionID, revoked: false },
        });

        // Verify DB was updated to set revoked: true
        expect(prisma.userSession.update).toHaveBeenCalledWith({
            where: { userSessionID: sessionID },
            data: expect.objectContaining({ revoked: true }),
        });
    });

    test("throws 404 when session is not found", async () => {
        // Setup: Simulate session not found (or already revoked)
        (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(signoutService(userID, sessionID)).rejects.toBeInstanceOf(
            ServiceException
        );
    });

    test("throws 500 when DB lookup fails", async () => {
        // Setup: Simulate DB error during read
        (prisma.userSession.findFirst as jest.Mock).mockRejectedValue(
            new Error("DB down")
        );

        await expect(signoutService(userID, sessionID)).rejects.toBeInstanceOf(
            ServiceException
        );

        // Ensure we don't attempt an update if lookup fails
        expect(prisma.userSession.update).not.toHaveBeenCalled();
    });

    test("throws 500 when update fails", async () => {
        // Setup: Found session, but DB error during write
        (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(mockSession);
        (prisma.userSession.update as jest.Mock).mockRejectedValue(
            new Error("Update failed")
        );

        await expect(signoutService(userID, sessionID)).rejects.toBeInstanceOf(
            ServiceException
        );
    });

    test("throws ServiceException for unknown runtime errors", async () => {
        // Setup: Simulate unexpected crash within logic
        (prisma.userSession.findFirst as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected crash");
        });

        await expect(signoutService(userID, sessionID)).rejects.toBeInstanceOf(
            ServiceException
        );
    });
});