import { prisma } from '@utils/prisma';
import { ServiceResponse } from '@utils/response';
import { sanitizeUser } from '@domain/types/user';

interface GetUserServiceParams {
  userID?: string;
  username?: string;
}

export const getUserService = async ({ userID, username }: GetUserServiceParams) => {
  // Validate input
  if (!userID && !username) {
    return ServiceResponse.error({
      success: false,
      statusCode: 400,
      message: "Either userId or username is required",
      errorType: "invalid_input",
    });
  }

  // Fetch user from DB
  const rawUser = await prisma.user.findUnique({
    where: userID ? { userID: userID } : { username: username! },
  });

  if (!rawUser) {
    return ServiceResponse.error({
      success: false,
      statusCode: 404,
      message: userID
        ? `User not found with ID: ${userID}`
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
