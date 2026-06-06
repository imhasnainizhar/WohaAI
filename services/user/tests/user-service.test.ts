import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { UserService } from '@/services/user-service';
import { CreateUserService } from '@/services/create-user';
import { UpdateUserService } from '@/services/update-user';
import { GetMeService } from '@/services/get-me';
import { EmailAlreadyTakenError, UsernameAlreadyTakenError, UserNotFoundError } from '@/errors/service-error';
import type { UserRepo } from '@/repo/user-repo';

const mockUser = {
  userID: 'user-456',
  firstName: 'Jane',
  lastName: 'Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  profilePicURI: null,
  dateOfBirth: null,
  twoFactorEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

let service: UserService;
let mockRepo: any;

beforeEach(() => {
  // Build a fully mocked repo
  mockRepo = {
    createUser: vi.fn().mockResolvedValue(undefined),
    updateUser: vi.fn().mockResolvedValue(undefined),
    getUserWithEmail: vi.fn().mockResolvedValue(null),
    getUserWithUsername: vi.fn().mockResolvedValue(null),
    getUserWithUserID: vi.fn().mockResolvedValue(mockUser),
  } as unknown as Mocked<UserRepo>

  // Wire services with the same mock repo
  const createUserService = new CreateUserService(mockRepo);
  const updateUserService = new UpdateUserService(mockRepo);
  const getMeService = new GetMeService(mockRepo);

  // Directly instantiate UserService (bypassing singleton)
  service = new UserService(createUserService, updateUserService, getMeService);
});

describe('UserService', () => {
  it('should create a user successfully', async () => {
    await expect(
      service.createUser({
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        hashedPassword: 'hashed',
        dateOfBirth: null,
      })
    ).resolves.toEqual({ userCreated: true });
    expect(mockRepo.createUser).toHaveBeenCalled();
  });

  it('should throw EmailAlreadyTakenError if email exists', async () => {
    mockRepo.getUserWithEmail.mockResolvedValue({} as any);
    await expect(
      service.createUser({
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        hashedPassword: 'hashed',
        dateOfBirth: null,
      })
    ).rejects.toBeInstanceOf(EmailAlreadyTakenError);
  });

  it('should throw UsernameAlreadyTakenError if username exists', async () => {
    mockRepo.getUserWithUsername.mockResolvedValue({} as any);
    await expect(
      service.createUser({
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        hashedPassword: 'hashed',
        dateOfBirth: null,
      })
    ).rejects.toBeInstanceOf(UsernameAlreadyTakenError);
  });

  it('should update user successfully', async () => {
    await expect(
      service.updateUser({
        userID: 'user-456',
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'janedoe2',
        dateOfBirth: null,
      })
    ).resolves.toEqual({ userUpdated: true });
    expect(mockRepo.updateUser).toHaveBeenCalled();
  });

  it('should throw UserNotFoundError when getMe cannot find user', async () => {
    mockRepo.getUserWithUserID.mockResolvedValue(null);
    await expect(service.getMe({ userID: 'nonexistent' })).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('should return user profile with getMe', async () => {
    const result = await service.getMe({ userID: 'user-456' });
    expect(result).toMatchObject({
      userID: 'user-456',
      username: 'janedoe',
      email: 'jane@example.com',
    });
  });
});
