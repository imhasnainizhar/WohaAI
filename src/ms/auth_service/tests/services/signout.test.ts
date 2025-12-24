import { signoutService } from "@services/signout";
import { prisma } from "@utils/prisma_client";
import { ServiceException } from "@utils/response";

// Mock dependencies
jest.mock("@utils/prisma_client", () => ({
    prisma: {
        userSession: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock("@utils/logger");

describe("signoutService", () => {
    const mockUserID = "user_123";
    const mockSessionID = "session_123";

    const mockSession = {
        userSessionID: mockSessionID,
        userID: mockUserID,
        revoked: false,
        userDeviceName: "Chrome",
        userDeviceID: "device_123",
        userIPAddress: "127.0.0.1",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should sign out user successfully", async () => {
        (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(mockSession);
        (prisma.userSession.update as jest.Mock).mockResolvedValue({ ...mockSession, revoked: true });

        const result = await signoutService(mockUserID, mockSessionID);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(prisma.userSession.update).toHaveBeenCalledWith({
            where: { userSessionID: mockSessionID },
            data: expect.objectContaining({ revoked: true }),
        });
    });

    it("should throw 404 if session not found", async () => {
        (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(signoutService(mockUserID, mockSessionID)).rejects.toMatchObject({
            response: { statusCode: 404, errorType: "session_expired" },
        });
    });

    it("should throw 500 if DB error finding session", async () => {
        (prisma.userSession.findFirst as jest.Mock).mockRejectedValue(new Error("DB error"));

        await expect(signoutService(mockUserID, mockSessionID)).rejects.toMatchObject({
            response: { statusCode: 500, errorType: "db_error" },
        });
    });

    it("should throw 500 if DB error updating session", async () => {
        (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(mockSession);
        (prisma.userSession.update as jest.Mock).mockRejectedValue(new Error("DB error"));

        await expect(signoutService(mockUserID, mockSessionID)).rejects.toMatchObject({
            response: { statusCode: 500, errorType: "db_error" },
        });
    });

    it("should throw 500 for unexpected errors", async () => {
        (prisma.userSession.findFirst as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        await expect(signoutService(mockUserID, mockSessionID)).rejects.toMatchObject({
            response: { statusCode: 500, errorType: "internal_server_error" },
        });
    });
});
