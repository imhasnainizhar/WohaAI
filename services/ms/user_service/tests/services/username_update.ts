import { usernameUpdateService } from '@services/username_update';
import { prisma } from '@utils/prisma';
import { ServiceException } from '@utils/response';

// Mock Prisma
jest.mock('@utils/prisma', () => ({
    prisma: {
        user: {
            update: jest.fn(),
        },
    },
}));

describe('usernameUpdateService', () => {
    const mockData = {
        userID: 'user_123',
        username: 'new_username',
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update the username successfully', async () => {
        const mockUpdatedUser = {
            userID: mockData.userID,
            username: mockData.username,
        };

        (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

        const result = await usernameUpdateService(mockData);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.data).toEqual(mockUpdatedUser);

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { userID: mockData.userID },
            data: { username: mockData.username },
            select: { userID: true, username: true },
        });
    });

    it('should throw ServiceException when user not found (P2025)', async () => {
        (prisma.user.update as jest.Mock).mockRejectedValue({
            code: 'P2025',
        });

        await expect(usernameUpdateService(mockData))
            .rejects
            .toBeInstanceOf(ServiceException);
    });

    it('should throw ServiceException when username already taken (P2002)', async () => {
        (prisma.user.update as jest.Mock).mockRejectedValue({
            code: 'P2002',
        });

        await expect(usernameUpdateService(mockData))
            .rejects
            .toBeInstanceOf(ServiceException);
    });

    it('should throw ServiceException for unexpected errors', async () => {
        (prisma.user.update as jest.Mock).mockRejectedValue(
            new Error('Unexpected DB error')
        );

        await expect(usernameUpdateService(mockData))
            .rejects
            .toBeInstanceOf(ServiceException);

        await expect(usernameUpdateService(mockData))
            .rejects.toMatchObject({
                response: { statusCode: 500 }
            });
    });
});
