import { getUserService } from '@services/getuser';
import { prisma } from '@utils/prisma';
import { sanitizeUser } from '@domain/types/user';
import { ServiceResponse } from '@utils/response';

// Mock prisma and sanitizeUser
jest.mock('@utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@domain/types/user', () => ({
  sanitizeUser: jest.fn(),
}));

describe('getUserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return error if neither userID nor username is provided', async () => {
    const result = await getUserService({});
    expect(result).toEqual(ServiceResponse.error({
      success: false,
      statusCode: 400,
      message: "Either userId or username is required",
      errorType: "invalid_input",
    }));
  });

  it('should return error if user is not found by ID', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getUserService({ userID: '123' });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { userID: '123' } });
    expect(result).toEqual(ServiceResponse.error({
      success: false,
      statusCode: 404,
      message: 'User not found with ID: 123',
      errorType: "not_found",
    }));
  });

  it('should return error if user is not found by username', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getUserService({ username: 'john' });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'john' } });
    expect(result).toEqual(ServiceResponse.error({
      success: false,
      statusCode: 404,
      message: `User not found with username: ${'john'}`,
      errorType: "not_found",
    }));
  });

  it('should return success if user is found', async () => {
    const rawUser = { userID: '123', username: 'john', password: 'secret' };
    const sanitizedUser = { userID: '123', username: 'john' };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(rawUser);
    (sanitizeUser as jest.Mock).mockReturnValue(sanitizedUser);

    const result = await getUserService({ userID: '123' });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { userID: '123' } });
    expect(sanitizeUser).toHaveBeenCalledWith(rawUser);
    expect(result).toEqual(ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "User found",
      data: sanitizedUser,
    }));
  });
});