import { nameUpdateService } from "@services/name_update";
import { prisma } from "@utils/prisma_client";
import { ServiceException } from "@utils/response";

jest.mock("@utils/prisma_client", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

jest.mock("@utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe("nameUpdateService", () => {
  const mockInput = {
    userID: "user_123",
    firstName: "John",
    lastName: "Doe",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update a user's name successfully", async () => {
    const mockUpdatedUser = {
      userID: "user_123",
      userFirstName: "John",
      userLastName: "Doe",
    };

    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const response = await nameUpdateService(mockInput);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { userID: mockInput.userID },
      data: {
        userFirstName: mockInput.firstName,
        userLastName: mockInput.lastName,
      },
      select: {
        userID: true,
        userFirstName: true,
        userLastName: true,
      },
    });

    expect(response).toEqual({
      success: true,
      statusCode: 200,
      message: "Name updated successfully",
      data: mockUpdatedUser,
    });
  });

  it("should throw ServiceException when user is not found (P2025)", async () => {
    (prisma.user.update as jest.Mock).mockRejectedValue({
      code: "P2025",
      message: "Record not found",
    });

    await expect(nameUpdateService(mockInput)).rejects.toMatchObject({
      response: {
        success: false,
        statusCode: 404,
        message: "User not found",
        errorType: "not_found",
      },
    });
  });

  it("should throw ServiceException for unexpected errors", async () => {
    (prisma.user.update as jest.Mock).mockRejectedValue(new Error("DB crash"));

    await expect(nameUpdateService(mockInput)).rejects.toMatchObject({
      response: {
        success: false,
        statusCode: 500,
        message: "Internal server error",
        errorType: "internal_server_error",
      },
    });
  });
});
