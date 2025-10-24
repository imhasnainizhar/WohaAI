import { prisma } from "@utils/prisma_client";
import { deleteCache, getCache } from "@utils/redis_client";
import { ServiceResponse, ServiceException } from "@utils/response";
import { logger } from "@utils/logger";

interface CreateUserInput {
  username: string;
  userFirstName: string,
  userLastName: string,
  email: string;
  hashedPassword: string;
  signupSessionID: string;
}

/**
 * @service createUserService
 * Creates a new user in the DB after verifying Redis entry for integrity.
 */
export const createUserService = async (userData: CreateUserInput) => {
  try {
    const {
      username,
      userFirstName,
      userLastName,
      email,
      hashedPassword,
      signupSessionID
    } = userData;

    // ✅ Step 1: Redis verification check
    const verifiedPayload = await getCache(`pending_signup:${signupSessionID}`);

    if (!verifiedPayload) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Invalid or expired verification token",
          errorType: "unauthorized_request",
        })
      );
    }

    const parsedVerification = JSON.parse(verifiedPayload);

    // ensure the email from Redis matches the current request
    if (parsedVerification.email !== email) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 403,
          message: "Request data mismatch — possible tampering detected",
          errorType: "data_tampered",
        })
      );
    }

    // ✅ Step 2: Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPassword: hashedPassword,
        userFirstName,
        userLastName,
        username,
      },
      select: {
        userID: true,
        email: true,
        username: true,
        userFirstName: true,
        userLastName: true,
        createdAt: true,
      },
    });

    logger.info(`✅ User created successfully: ${newUser.userID}`);

    // ✅ Step 3: Delete the Redis entry (one-time use)
    await deleteCache(`pending_signup:${signupSessionID}`);

    return ServiceResponse.success({
      success: true,
      statusCode: 201,
      message: "User created successfully",
      data: {
        user: newUser,
        userSessionCreated: false,
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
