import { prisma } from '@utils/prisma_client';
import { ServiceResponse } from '@utils/service_response';
import { sanitizeUser } from '@custom_types/user.type';

interface GetUserParams {
  userId?: string;
  username?: string;
}

export const getUserService = async ({ userId, username }: GetUserParams) => {
  // Validate input
  if (!userId && !username) {
    return ServiceResponse.error({
      success: false,
      statusCode: 400,
      message: "Either userId or username is required",
      errorType: "invalid_input",
    });
  }

  // Fetch user from DB
  const rawUser = await prisma.user.findUnique({
    where: userId ? { id: userId } : { username: username! },
  });

  if (!rawUser) {
    return ServiceResponse.error({
      success: false,
      statusCode: 404,
      message: userId
        ? `User not found with ID: ${userId}`
        : `User not found with username: ${username}`,
      errorType: "not_found",
    });
  }

  return ServiceResponse.success({
    success: true,
    statusCode: 200,
    message: "User found",
    data: sanitizeUser(rawUser),
  });
};
