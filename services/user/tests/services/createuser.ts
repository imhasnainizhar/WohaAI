import { createUserService } from '@services/createuser';
import { prisma } from '@utils/prisma';
import { getCache, deleteCache } from '@utils/redis';
import { ServiceException } from '@utils/response';
import { logger } from '@utils/logger';


// Mocking Logger
jest.mock('@utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn()
  }
}));

// Mocking Prisma
jest.mock('@utils/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
    },
  },
}));

// Mocking Redis Caching
jest.mock('@utils/redis', () => ({
  getCache: jest.fn(),
  deleteCache: jest.fn(),
}));


// Describing createUser Test Suite
describe('createUserService', () => {

  afterEach(() => jest.clearAllMocks());

  const mockUserData = {
    email: 'new@example.com',
    userFirstName: 'New',
    userLastName: 'User',
    username: 'newuser',
    hashedPassword: 'password123',
    signupSessionID: '2843hani_tests'
  };

  // Describing Test 1
  it('should create a new user successfully', async () => {

    (getCache as jest.Mock).mockResolvedValue(
      JSON.stringify({ email: mockUserData.email })
    );

    (prisma.user.create as jest.Mock).mockResolvedValue({
      userID: 'u1',
      email: mockUserData.email,
      username: mockUserData.username,
      userFirstName: mockUserData.userFirstName,
      userLastName: mockUserData.userLastName,
      createdAt: new Date()
    });

    (deleteCache as jest.Mock).mockResolvedValue(true);

    const result = await createUserService(mockUserData);

    expect(result.success).toBe(true);
    expect(result?.data?.user?.email).toBe(mockUserData.email);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  // Describing Test 2
  it('should fail if verification token is missing', async () => {

    (getCache as jest.Mock).mockResolvedValue(null);

    await expect(createUserService(mockUserData))
      .rejects.toBeInstanceOf(ServiceException);

    await expect(createUserService(mockUserData))
      .rejects.toMatchObject({
        response: expect.objectContaining({
          message: 'Invalid or expired verification token'
        })
      });

    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
