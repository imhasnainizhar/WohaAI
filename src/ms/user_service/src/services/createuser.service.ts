import { prisma } from "@utils/prisma_client";
import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@errors/service_exception";
import { logger } from "@utils/logger";

interface CreateUserInput {
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  username: string;
}

/**
 * @service createUserService
 * Creates a new user in the DB after email verification
 */
export const createUserService = async (input: CreateUserInput) => {
  try {
    const { email, hashedPassword, firstName, lastName, username } = input;

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName,
        createdAt: true,
      },
    });

    logger.info(`✅ User created successfully: ${newUser.id}`);

    // Return structured service response
    return ServiceResponse.success({
      success: true,
      statusCode: 201,
      message: "User created successfully",
      data: {
        user: newUser,
      },
    });
  } catch (err: any) {
    logger.error("❌ createUserService error:", err);

    if (err instanceof ServiceException) throw err;

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: "Internal server error during user creation",
        errorType: "internal_server_error",
      })
    );
  }
};
