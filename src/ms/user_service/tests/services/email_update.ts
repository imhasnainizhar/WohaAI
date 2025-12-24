import { emailUpdateService } from "@services/email_update";
import { prisma } from "@utils/prisma_client";
import { logger } from "@utils/logger";

jest.mock("@utils/prisma_client", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

jest.mock("@utils/logger", () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("emailUpdateService", () => {
  const mockInput = {
    userID: "user_123",
    email: "newemail@example.com",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update email successfully", async () => {
    const mockUpdatedUser = { userID: "user_123", email: "newemail@example.com" };

    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const response = await emailUpdateService(mockInput);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { userID: mockInput.userID },
      data: { email: mockInput.email },
      select: { userID: true, email: true },
    });

    expect(response).toEqual({
      success: true,
      statusCode: 200,
      message: "Email updated successfully",
      data: mockUpdatedUser,
    });
  });

  it("should throw ServiceException when user not found (P2025)", async () => {
    (prisma.user.update as jest.Mock).mockRejectedValue({
      code: "P2025",
      message: "Record not found",
    });

    await expect(emailUpdateService(mockInput)).rejects.toMatchObject({
      response: {
        success: false,
        statusCode: 404,
        message: "User not found",
        errorType: "not_found",
      },
    });
  });

  it("should throw ServiceException when email already in use (P2002)", async () => {
    (prisma.user.update as jest.Mock).mockRejectedValue({
      code: "P2002",
      message: "Unique constraint failed",
    });

    await expect(emailUpdateService(mockInput)).rejects.toMatchObject({
      response: {
        success: false,
        statusCode: 409,
        message: "Email already in use",
        errorType: "conflict",
      },
    });
  });

  it("should throw ServiceException for unexpected errors", async () => {
    (prisma.user.update as jest.Mock).mockRejectedValue(new Error("DB crash"));

    await expect(emailUpdateService(mockInput)).rejects.toMatchObject({
      response: {
        success: false,
        statusCode: 500,
        message: "Internal server error",
        errorType: "internal_server_error",
      },
    });

    expect(logger.error).toHaveBeenCalledWith(
      { error: expect.any(Error) },
      "Unhandled error in emailUpdateService"
    );
  });
});
