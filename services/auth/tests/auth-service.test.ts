import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SigninService } from '@/services/signin';
import { AuthRepo } from '@/repo/auth-repo';
import { InvalidCredentialsError } from '@/errors/service-error';
import { createJwtToken } from '@packages/jwt';
import argon2 from 'argon2';

vi.mock('@/repo/auth-repo');
vi.mock('@packages/jwt');
vi.mock('argon2');

const mockUser = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  hashedPassword: 'hashedPwd',
  profilePicURI: '',
};

describe('SigninService', () => {
  let repo: any;
  let service: SigninService;

  beforeEach(() => {
    repo = new AuthRepo(null as any);
    (repo.getUserWithUsernameOrEmail as any) = vi.fn().mockResolvedValue(mockUser);
    (argon2.verify as any) = vi.fn().mockResolvedValue(true);
    (createJwtToken as any).mockImplementation(() => 'token');
    service = new SigninService(repo);
  });

  it('should sign in with correct credentials', async () => {
    const result = await service.execute({
      usernameOrEmail: { type: 'email', value: 'test@example.com' },
      password: 'plainPwd',
      clientData: {
        userIPAddress: '127.0.0.1',
        userDeviceName: 'test-device',
        userDeviceType: 'desktop',
        userDeviceOS: 'windows',
        userDeviceBrowser: 'chrome',
      },
    });
    expect(repo.getUserWithUsernameOrEmail).toHaveBeenCalled();
    expect(argon2.verify).toHaveBeenCalledWith(mockUser.hashedPassword, 'plainPwd');
    expect(result).toEqual({
      profilePicURI: '',
      id: 'user-123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      refreshToken: 'token',
      accessToken: 'token',
    });
  });

  it('should throw InvalidCredentialsError for wrong password', async () => {
    (argon2.verify as any).mockResolvedValue(false);
    await expect(
      service.execute({
        usernameOrEmail: { type: 'email', value: 'test@example.com' },
        password: 'wrongPwd',
        clientData: {
          userIPAddress: '127.0.0.1',
          userDeviceName: 'test-device',
          userDeviceType: 'desktop',
          userDeviceOS: 'windows',
          userDeviceBrowser: 'chrome',
        },
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
