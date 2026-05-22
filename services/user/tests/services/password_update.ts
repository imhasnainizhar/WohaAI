import { passwordUpdateService } from "@services/password_update";
import { prisma } from "@utils/prisma";
import argon2 from "argon2";
import { ServiceException } from "@utils/response";

jest.mock("@utils/prisma", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

jest.mock("argon2", () => ({
  hash: jest.fn(),
}));

describe("passwordUpdateService", () => {

  const mockUser = {
    userID: "user123",
    email: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update password successfully", async () => {

    (argon2.hash as jest.Mock).mockResolvedValue("hashed-password");

    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

    const result = await passwordUpdateService({
      userID: "user123",
      newPassword: "newPassword123",
    });

    expect(argon2.hash).toHaveBeenCalledWith("newPassword123");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { userID: "user123" },
      data: { hashedPassword: "hashed-password" },
      select: { userID: true, email: true },
    });

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      message: "Password updated successfully",
      data: mockUser,
    });
  });

  test("should throw ServiceException when user not found", async () => {

    (argon2.hash as jest.Mock).mockResolvedValue("hashed-password");

    (prisma.user.update as jest.Mock).mockRejectedValue({
      code: "P2025",
    });

    await expect(
      passwordUpdateService({
        userID: "missing_user",
        newPassword: "abc12345",
      })
    ).rejects.toBeInstanceOf(ServiceException);

    await expect(
      passwordUpdateService({
        userID: "missing_user",
        newPassword: "abc12345",
      })
    ).rejects.toMatchObject({
      response: {
        success: false,
        statusCode: 404,
        message: "User not found",
        errorType: "not_found",
      },
    });
  });

  test("should throw ServiceException on unexpected errors", async () => {

    (argon2.hash as jest.Mock).mockResolvedValue("hashed-password");

    (prisma.user.update as jest.Mock).mockRejectedValue(
      new Error("DB broken")
    );

    await expect(
      passwordUpdateService({
        userID: "user123",
        newPassword: "abc12345",
      })
    ).rejects.toBeInstanceOf(ServiceException);

    await expect(
      passwordUpdateService({
        userID: "user123",
        newPassword: "abc12345",
      })
    ).rejects.toMatchObject({
      response: {
        success: false,
        statusCode: 500,
        message: "Internal server error",
        errorType: "internal_server_error",
      },
    });
  });
});
